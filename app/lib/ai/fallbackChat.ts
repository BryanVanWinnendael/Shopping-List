import { createSystemPrompt } from "./prompt"
import { getCloudChain, type CloudTarget } from "./cloudProviders"
import { recordTokenUsage } from "./usage"
import { ChatOptions } from "@/types/ai"

type GroqMessage = {
    role: "system" | "user" | "assistant"
    content: string
}

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

async function requestCloud({ model, provider, apiKey }: CloudTarget, messages: GroqMessage[]) {
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            ...provider.extraHeaders,
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.3,
            max_completion_tokens: 1200,
        }),
    })

    if (!response.ok) {
        const errorText = await response.text()

        console.error(`${provider.name} request failed (${model}, ${response.status})`, errorText)

        throw new CloudError(
            response.status,
            { provider, apiKey, model },
            `${provider.name} request failed (${response.status}): ${errorText}`
        )
    }

    const data = await response.json()

    // Meter every cloud call: lifetime totals persist locally, and the
    // provider's rate-limit headers expose the remaining window when present.
    void recordTokenUsage(`${provider.id}:${model}`, data?.usage, response.headers)

    return data
}

const extractContent = (data: any) => data?.choices?.[0]?.message?.content?.trim()

export async function completeFallbackChat({ page, pathname, messages, context }: ChatOptions): Promise<string> {
    const systemMessage: GroqMessage = {
        role: "system",
        content: createSystemPrompt({
            page,
            pathname,
            context,
        }),
    }

    const requestMessages: GroqMessage[] = [systemMessage, ...messages.map(({ role, content }) => ({ role, content }))]

    const chain = getCloudChain()

    if (chain.length === 0) {
        throw new Error("No cloud AI provider is configured")
    }

    // Walk the chain, falling through when a provider is out of quota or
    // returns nothing usable. The first good answer wins.
    let lastError: unknown = null

    for (const target of chain) {
        try {
            const data = await requestCloud(target, requestMessages)
            const content = extractContent(data)

            if (content) {
                return content
            }

            console.error(`${target.provider.name} (${target.model}) returned an empty response.`, data)
        } catch (error) {
            lastError = error

            // Rate limits and missing keys are worth retrying elsewhere;
            // anything else is a real failure worth surfacing.
            if (error instanceof CloudError && error.status !== 429 && error.status !== 402 && error.status !== 403) {
                console.error(`${target.provider.name} failed. Not falling back.`, error)
                throw error
            }

            console.warn(`${target.provider.name} (${target.model}) unavailable, trying next provider.`)
        }
    }

    throw lastError instanceof Error ? lastError : new Error("All cloud AI providers are unavailable")
}
