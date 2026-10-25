import { useSyncExternalStore } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

const STORAGE_KEY = "ai_token_usage_v1"

export type TokenWindow = {
    limit: number
    remaining: number
    reset?: string
}

export type TokenUsageState = {
    totalTokens: number
    byModel: Record<string, number>
    window: TokenWindow | null
    updatedAt: number
}

const initialState: TokenUsageState = {
    totalTokens: 0,
    byModel: {},
    window: null,
    updatedAt: 0,
}

let state: TokenUsageState = initialState
const listeners = new Set<() => void>()

const emit = () => {
    listeners.forEach((listener) => listener())
}

export function subscribeTokenUsage(listener: () => void) {
    listeners.add(listener)

    return () => {
        listeners.delete(listener)
    }
}

export function getTokenUsageSnapshot() {
    return state
}

export function useTokenUsage() {
    return useSyncExternalStore(subscribeTokenUsage, getTokenUsageSnapshot)
}

export async function loadTokenUsage() {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY)

        if (raw) {
            state = { ...initialState, ...JSON.parse(raw) }
        }
    } catch (error) {
        console.warn("Failed to load AI token usage:", error)
    }

    emit()
}

async function persist() {
    try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
        console.warn("Failed to persist AI token usage:", error)
    }
}

const parseHeaderInt = (headers: Headers, name: string) => {
    const raw = headers.get(name)

    if (!raw) return undefined

    const parsed = parseInt(raw, 10)

    return Number.isNaN(parsed) ? undefined : parsed
}

export async function recordTokenUsage(model: string, usage?: { total_tokens?: number | null }, headers?: Headers) {
    const total = usage?.total_tokens ?? 0

    const nextByModel = { ...state.byModel }

    if (total > 0) {
        nextByModel[model] = (nextByModel[model] ?? 0) + total
    }

    let nextWindow = state.window

    if (headers) {
        const limit = parseHeaderInt(headers, "x-ratelimit-limit-tokens")
        const remaining = parseHeaderInt(headers, "x-ratelimit-remaining-tokens")
        // Header values come straight off the wire, so strip anything that
        // is not plain readable text before showing it in the UI.
        const reset = headers
            .get("x-ratelimit-reset-tokens")
            ?.replace(/[^0-9a-zA-Z.]/g, "")
            .slice(0, 12)

        if (limit !== undefined && remaining !== undefined) {
            nextWindow = { limit, remaining, reset }
        } else if (reset && nextWindow) {
            nextWindow = { ...nextWindow, reset }
        }
    }

    // Providers that don't expose rate-limit headers (most of OpenRouter's
    // free endpoints, for one) still need a usable figure, so fall back to
    // subtracting from the last known window.
    if (nextWindow && total > 0 && !headers?.get("x-ratelimit-limit-tokens")) {
        nextWindow = { ...nextWindow, remaining: Math.max(0, nextWindow.remaining - total) }
    }

    state = {
        totalTokens: state.totalTokens + total,
        byModel: nextByModel,
        window: nextWindow,
        updatedAt: Date.now(),
    }

    emit()
    await persist()
}

export const formatTokens = (value: number) => value.toLocaleString("en-US")
