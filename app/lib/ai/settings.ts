import AsyncStorage from "@react-native-async-storage/async-storage"
import { AIProvider } from "@/types/ai"

const AI_PROVIDER_KEY = "app_aiProviderKey"

export const getAIProvider = async (): Promise<AIProvider | null> => {
    const provider = await AsyncStorage.getItem(AI_PROVIDER_KEY)

    if (provider === "cloud" || provider === "built-in" || provider === "disabled") {
        return provider
    }

    return null
}

export const setAIProvider = async (provider: AIProvider | null): Promise<void> => {
    if (provider === null) {
        await AsyncStorage.removeItem(AI_PROVIDER_KEY)
        return
    }

    await AsyncStorage.setItem(AI_PROVIDER_KEY, provider)
}

export const clearAIProvider = async (): Promise<void> => {
    await AsyncStorage.removeItem(AI_PROVIDER_KEY)
}

export async function supportsOnDeviceAI(): Promise<boolean> {
    if (__DEV__) return false

    try {
        const { isAvailable } = await import("expo-ai-kit")

        return await isAvailable()
    } catch (error) {
        console.error("Failed to check on-device AI support:", error)
        return false
    }
}
