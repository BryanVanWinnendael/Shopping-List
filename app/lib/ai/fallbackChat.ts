import { createSystemPrompt } from "./prompt"
import { getCloudChain, type CloudTarget } from "./cloudProviders"
import { AI_TOOLS, TOOL_LABELS, executeAiTool } from "./tools"
import { ChatContext } from "@/types/ai"
import { recordTokenUsage } from "./usage"
import { ChatOptions } from "@/types/ai"

type ChatMessage = {
    role: "system" | "user" | "assistant" | "tool"
    content: string
    tool_calls?: {
        id: string
        type: "function"
        function: { name: string; arguments: string }
    }[]
    tool_call_id?: string
}

const MAX_TOOL_ROUNDS = 4

class CloudError extends Error {
    status: number
    target: CloudTarget

    constructor(status: number, target: CloudTarget, message: string) {
        super(message)
        this.name = "CloudError"
        this.status = status
        this.target = target
    }
}

export { CloudError }

async function requestCloud(target: CloudTarget, messages: ChatMessage[], withTools: boolean) {
    const response = await fetch(`${target.provider.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${target.apiKey}`,
            ...target.provider.extraHeaders,
        },
        body: JSON.stringify({
            model: target.model,
            messages,
            temperature: 0.3,
            max_completion_tokens: 1200,
            ...(withTools ? { tools: AI_TOOLS, tool_choice: "auto" } : {}),
        }),
    })

    if (!response.ok) {
        const errorText = await response.text()

        console.error(`${target.provider.name} request failed (${target.model}, ${response.status})`, errorText)

        throw new CloudError(
            response.status,
            target,
            `${target.provider.name} request failed (${response.status}): ${errorText}`
        )
    }

    const data = await response.json()

    // Meter every cloud call: lifetime totals persist locally, and the
    // provider's rate-limit headers expose the remaining window when present.
    void recordTokenUsage(`${target.provider.id}:${target.model}`, data?.usage, response.headers)

    return data
}

const extractContent = (data: any) => data?.choices?.[0]?.message?.content?.trim()
const extractToolCalls = (data: any) => data?.choices?.[0]?.message?.tool_calls ?? []

const KNOWN_TOOL_NAMES = ["add_to_shopping_list", "remove_from_shopping_list"] as const

// Some free models emit the call as raw text ({"name": ..., "arguments": {...}})
// instead of a formal tool call. Extract it by balancing braces from the name.
function extractTextCall(content: string | undefined | null) {
    if (!content) return null

    const nameMatch = content.match(/"name"\s*:\s*"(add_to_shopping_list|remove_from_shopping_list)"/)

    if (!nameMatch || nameMatch.index === undefined) return null

    const start = content.lastIndexOf("{", nameMatch.index)

    if (start === -1) return null

    let depth = 0

    for (let i = start; i < content.length; i++) {
        if (content[i] === "{") depth++
        if (content[i] === "}") depth--

        if (depth === 0) {
            try {
                const parsed = JSON.parse(content.slice(start, i + 1))

                if (parsed && KNOWN_TOOL_NAMES.includes(parsed.name)) {
                    return {
                        id: `textcall-${start}`,
                        type: "function" as const,
                        function: {
                            name: parsed.name as string,
                            arguments:
                                typeof parsed.arguments === "string"
                                    ? parsed.arguments
                                    : JSON.stringify(parsed.arguments ?? {}),
                        },
                    }
                }
            } catch {
                // Not valid JSON, treat the reply as plain text.
            }

            return null
        }
    }

    return null
}

// A retry without tools must not resend tool_calls or tool messages:
// providers reject tool history when no tools are defined on the request.
const stripToolHistory = (messages: ChatMessage[]): ChatMessage[] => {
    const clean: ChatMessage[] = []

    for (const message of messages) {
        if (message.role === "tool") continue

        if (message.role === "assistant" && message.tool_calls?.length) {
            const names = message.tool_calls.map((call) => call.function.name).join(", ")

            clean.push({
                role: "assistant",
                content: [message.content, `[tried to call: ${names}]`].filter(Boolean).join("\n"),
            })
            continue
        }

        clean.push(message)
    }

    return clean
}

async function completeWithTarget(
    target: CloudTarget,
    messages: ChatMessage[],
    context: ChatContext,
    onStage?: (stage: string | null) => void
): Promise<string> {
    let withTools = true
    let current: ChatMessage[] = [...messages]

    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
        let data: any

        onStage?.(round === 0 ? "Thinking…" : "Checking results…")

        try {
            data = await requestCloud(target, current, withTools)
        } catch (error) {
            // Some free endpoints reject function calling outright.
            // Retry once as a plain chat so the user still gets an answer.
            if (withTools && error instanceof CloudError && error.status === 400) {
                console.warn(`${target.provider.name} (${target.model}) rejected tools, retrying without them.`)
                withTools = false
                current = stripToolHistory(current)
                data = await requestCloud(target, current, false)
            } else {
                throw error
            }
        }

        const toolCalls = withTools ? extractToolCalls(data) : []
        const textCall = withTools && !toolCalls.length ? extractTextCall(extractContent(data)) : null
        const calls = textCall ? [textCall] : toolCalls

        if (!calls.length) {
            const content = extractContent(data)

            if (content) {
                return content
            }

            console.error(`${target.provider.name} (${target.model}) returned an empty response.`, data)
            throw new Error(`${target.provider.name} returned an empty response`)
        }

        current = [
            ...current,
            {
                role: "assistant",
                content: extractContent(data) ?? "",
                tool_calls: calls,
            },
        ]

        const labels = [
            ...new Set(
                calls.map((call: { function: { name: string } }) => TOOL_LABELS[call.function.name] ?? "Working…")
            ),
        ]
        onStage?.(`${labels.join(" + ")}…`)

        for (const call of calls) {
            const result = await executeAiTool(call.function.name, call.function.arguments, context)

            current.push({
                role: "tool",
                tool_call_id: call.id,
                content: result,
            })
        }
    }

    throw new Error(`${target.provider.name} did not finish after ${MAX_TOOL_ROUNDS} tool rounds`)
}

export async function completeFallbackChat({
    page,
    pathname,
    messages,
    context,
    provider,
    onStage,
}: ChatOptions): Promise<string> {
    const systemMessage: ChatMessage = {
        role: "system",
        content: createSystemPrompt({
            page,
            pathname,
            context,
            provider,
        }),
    }

    const requestMessages: ChatMessage[] = [systemMessage, ...messages.map(({ role, content }) => ({ role, content }))]

    const chain = getCloudChain()

    if (chain.length === 0) {
        throw new Error("No cloud AI provider is configured")
    }

    // Walk the chain, falling through when a provider is out of quota or
    // returns nothing usable. The first good answer wins.
    let lastError: unknown = null

    for (const target of chain) {
        try {
            return await completeWithTarget(target, requestMessages, context, onStage)
        } catch (error) {
            lastError = error

            // Auth, quota, and rate problems are worth retrying elsewhere;
            // anything else is a real failure worth surfacing.
            if (
                error instanceof CloudError &&
                (error.status === 429 || error.status === 402 || error.status === 403 || error.status === 401)
            ) {
                console.warn(`${target.provider.name} (${target.model}) unavailable, trying next provider.`)
                continue
            }

            console.error(`${target.provider.name} failed. Not falling back.`, error)
            throw error
        }
    }

    throw lastError instanceof Error ? lastError : new Error("All cloud AI providers are unavailable")
}
