import { createSystemPrompt } from "./prompt"
import { ChatOptions } from "@/types/ai"
import { logsClient } from "@/lib/logs"

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

const PRIMARY_MODEL = "openai/gpt-oss-20b"
const FALLBACK_MODEL = "openai/gpt-oss-120b"

type GroqMessage = {
    role: "system" | "user" | "assistant"
    content: string
}

class GroqError extends Error {
    status: number
    model: string

    constructor(status: number, model: string, message: string) {
        super(message)
        this.name = "GroqError"
        this.status = status
        this.model = model
    }
}

async function requestGroq({ model, messages }: { model: string; messages: GroqMessage[] }) {
    logsClient.createLog("AI: Using Cliud Chat", "GET", false)

    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
        throw new Error("Groq API key is not configured")
    }

    const response = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
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

        console.error(`Groq request failed (${model}, ${response.status})`, errorText)

        throw new GroqError(response.status, model, `Groq request failed (${response.status}): ${errorText}`)
    }

    return response.json()
}

export async function completeFallbackChat({ page, pathname, messages, context }: ChatOptions): Promise<string> {
    const groqMessages: GroqMessage[] = messages.map(({ role, content }) => ({
        role,
        content,
    }))

    const systemMessage: GroqMessage = {
        role: "system",
        content: createSystemPrompt({
            page,
            pathname,
            context,
        }),
    }

    const requestMessages: GroqMessage[] = [systemMessage, ...groqMessages]

    // --------------------------------------------------
    // 1. Primary model
    // --------------------------------------------------

    try {
        const data = await requestGroq({
            model: PRIMARY_MODEL,
            messages: requestMessages,
        })

        const content = data?.choices?.[0]?.message?.content

        if (content?.trim()) {
            return content.trim()
        }

        console.error(`${PRIMARY_MODEL} returned an empty response.`, data)

        throw new Error(`${PRIMARY_MODEL} returned an empty response`)
    } catch (error) {
        // Only fall back when the primary model is
        // actually rate limited.
        if (!(error instanceof GroqError) || error.status !== 429) {
            console.error(`${PRIMARY_MODEL} failed. Not falling back.`, error)

            throw error
        }

        console.warn(`${PRIMARY_MODEL} is rate limited. ` + `Falling back to ${FALLBACK_MODEL}.`)
    }

    // --------------------------------------------------
    // 2. Fallback model
    // --------------------------------------------------

    const fallbackData = await requestGroq({
        model: FALLBACK_MODEL,
        messages: requestMessages,
    })

    const fallbackContent = fallbackData?.choices?.[0]?.message?.content

    if (!fallbackContent?.trim()) {
        console.error(`${FALLBACK_MODEL} returned an empty response.`, fallbackData)

        throw new Error(`${FALLBACK_MODEL} returned an empty response`)
    }

    return fallbackContent.trim()
}
