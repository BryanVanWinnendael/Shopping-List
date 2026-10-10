import { GROQ_API_KEY, OPENROUTER_API_KEY } from "@env"

export type CloudProviderId = "groq" | "openrouter"

type CloudProvider = {
    id: CloudProviderId
    name: string
    baseUrl: string
    /** Build-time key from `.env`. Providers without one are skipped. */
    apiKey: string | undefined
    /** Ordered models. First that answers wins, later ones are fallbacks. */
    models: string[]
    /** Extra headers, e.g. OpenRouter wants an attribution header. */
    extraHeaders?: Record<string, string>
}

export const CLOUD_PROVIDERS: CloudProvider[] = [
    {
        id: "groq",
        name: "Groq",
        baseUrl: "https://api.groq.com/openai/v1",
        apiKey: GROQ_API_KEY,
        models: ["openai/gpt-oss-20b", "openai/gpt-oss-120b"],
    },
    {
        id: "openrouter",
        name: "OpenRouter",
        baseUrl: "https://openrouter.ai/api/v1",
        apiKey: OPENROUTER_API_KEY,
        models: ["nvidia/nemotron-3-super-120b-a12b:free", "openrouter/free"],
        extraHeaders: {
            "HTTP-Referer": "https://github.com/bryan/lijst",
            "X-Title": "Shopping List",
        },
    },
]

export type CloudTarget = {
    provider: CloudProvider
    apiKey: string
    model: string
}

/**
 * Providers the app can actually use right now, in order of preference.
 * Only providers with a configured key are included, and only their first
 * two models — enough for a fallback without hammering rate limits.
 */
export function getCloudChain(): CloudTarget[] {
    const chain: CloudTarget[] = []

    for (const provider of CLOUD_PROVIDERS) {
        const apiKey = provider.apiKey

        if (!apiKey) continue

        for (const model of provider.models) {
            chain.push({ provider, apiKey, model })
        }
    }

    return chain
}
