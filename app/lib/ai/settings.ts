import AsyncStorage from "@react-native-async-storage/async-storage"
import { AIProvider } from "@/types/ai"

const AI_PROVIDER_KEY = "app_aiProviderKey"
const AI_MODEL_DOWNLOADED_KEY = "app_aiModelDownloaded"
const AI_DOWNLOADED_MODELS_KEY = "app_aiDownloadedModels"

export const AI_MODEL_ID = "qwen3-0.6b"

const LOCAL_MODELS = [
    {
        id: AI_MODEL_ID,
        name: "Qwen3 0.6B",
        parameterCount: "0.6B",
        quantization: "int4",
        downloadUrl:
            "https://huggingface.co/litert-community/Qwen3-0.6B/resolve/dd97997951bb15a2a71f539ba17f604707c0b11a/Qwen3-0.6B.litertlm",
        sha256: "555579ff2f4fd13379abe69c1c3ab5200f7338bc92471557f1d6614a6e5ab0b4",
        sizeBytes: 614_236_160,
        contextWindow: 4096,
        minRamBytes: 2_000_000_000,
        supportedPlatforms: ["ios", "android"] as ("ios" | "android")[],
        license: "Apache-2.0",
    },
]

const registeredIds = new Set<string>()

export const registerLocalModels = async () => {
    if (__DEV__) return

    const { registerModel } = await import("expo-ai-kit")

    for (const model of LOCAL_MODELS) {
        if (registeredIds.has(model.id)) continue

        try {
            registerModel(model)
            registeredIds.add(model.id)
        } catch (error) {
            console.error(`Failed to register model ${model.id}:`, error)
        }
    }
}

export const getDownloadedModelIds = async (): Promise<string[]> => {
    try {
        const raw = await AsyncStorage.getItem(AI_DOWNLOADED_MODELS_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

const setModelDownloadedFlag = async (id: string, downloaded: boolean) => {
    const ids = new Set(await getDownloadedModelIds())

    if (downloaded) ids.add(id)
    else ids.delete(id)

    await AsyncStorage.setItem(AI_DOWNLOADED_MODELS_KEY, JSON.stringify([...ids]))
}

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
    if (__DEV__) return false

    await registerLocalModels()

    try {
        const { getDownloadableModels } = await import("expo-ai-kit")
        const models = await getDownloadableModels()
        const model = models.find((entry) => entry.id === AI_MODEL_ID)

        if (model) {
            const downloaded = ["downloaded", "loading", "ready"].includes(model.status)
            await setModelDownloadedFlag(AI_MODEL_ID, downloaded)
            return downloaded
        }
    } catch (error) {
        console.error("Failed to read native AI model status:", error)
    }

    const value = await AsyncStorage.getItem(AI_MODEL_DOWNLOADED_KEY)
    return value === "true"
}

export async function downloadLocalModel(onProgress?: (progress: number) => void) {
    if (__DEV__) return

    await registerLocalModels()
    const { downloadModel, deleteModel } = await import("expo-ai-kit")

    try {
        await downloadModel(AI_MODEL_ID, { onProgress })
    } catch (error) {
        try {
            await deleteModel(AI_MODEL_ID)
        } catch {}
        await setModelDownloadedFlag(AI_MODEL_ID, false)
        throw error
    }

    await setModelDownloadedFlag(AI_MODEL_ID, true)
    return AI_MODEL_ID
}

export async function loadLocalModel() {
    if (__DEV__) return

    await registerLocalModels()
    const { setModel } = await import("expo-ai-kit")

    await setModel(AI_MODEL_ID, { generation: { temperature: 0.4, maxTokens: 512 } })
}

export async function deleteLocalModel() {
    if (__DEV__) return

    await registerLocalModels()
    const { deleteModel } = await import("expo-ai-kit")

    await deleteModel(AI_MODEL_ID)

    await AsyncStorage.removeItem(AI_MODEL_DOWNLOADED_KEY)
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
