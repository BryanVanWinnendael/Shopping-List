import AsyncStorage from "@react-native-async-storage/async-storage"
import { AIProvider } from "@/types/ai"

const AI_PROVIDER_KEY = "app_aiProviderKey"
const AI_MODEL_DOWNLOADED_KEY = "app_aiModelDownloaded"
export const AI_MODEL_ID = "qwen3-0.6b"

export const getAIProvider = async (): Promise<AIProvider | null> => {
    const provider = await AsyncStorage.getItem(AI_PROVIDER_KEY)

    if (provider === "cloud" || provider === "built-in" || provider === "downloaded" || provider === "disabled") {
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

export const isLocalModelDownloaded = async (): Promise<boolean> => {
    try {
        if (__DEV__) {
            return false
        }

        const { getDownloadableModels } = await import("expo-ai-kit")
        const models = await getDownloadableModels()
        const model = models.find((entry) => entry.id === AI_MODEL_ID)

        if (model) {
            const downloaded = model.status === "downloaded" || model.status === "loading" || model.status === "ready"

            if (downloaded) {
                await AsyncStorage.setItem(AI_MODEL_DOWNLOADED_KEY, "true")
            } else {
                await AsyncStorage.removeItem(AI_MODEL_DOWNLOADED_KEY)
            }

            return downloaded
        }
    } catch (error) {
        console.error("Failed to read native AI model status:", error)
    }

    const value = await AsyncStorage.getItem(AI_MODEL_DOWNLOADED_KEY)
    return value === "true"
}

export async function downloadLocalModel(onProgress?: (progress: number) => void) {
    const { downloadModel, deleteModel } = await import("expo-ai-kit")

    try {
        await downloadModel(AI_MODEL_ID, { onProgress })
    } catch (error) {
        const message = String((error as Error)?.message ?? error)

        if (!message.toLowerCase().includes("sha256")) throw error

        // Remove the corrupt/partial file and retry once from scratch.
        try {
            await deleteModel(AI_MODEL_ID)
        } catch {}
        await downloadModel(AI_MODEL_ID, { onProgress })
    }

    await AsyncStorage.setItem(AI_MODEL_DOWNLOADED_KEY, "true")

    return AI_MODEL_ID
}

export async function loadLocalModel() {
    const { setModel } = await import("expo-ai-kit")

    await setModel(AI_MODEL_ID, {
        generation: {
            temperature: 0.7,
            maxTokens: 512,
        },
    })
}

export async function deleteLocalModel() {
    const { deleteModel } = await import("expo-ai-kit")

    await deleteModel(AI_MODEL_ID)

    await AsyncStorage.removeItem(AI_MODEL_DOWNLOADED_KEY)
}

export async function supportsOnDeviceAI(): Promise<boolean> {
    try {
        if (__DEV__) {
            return false
        }
        const { isAvailable } = await import("expo-ai-kit")

        return await isAvailable()
    } catch (error) {
        console.error("Failed to check on-device AI support:", error)
        return false
    }
}
