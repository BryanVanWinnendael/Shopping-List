import AsyncStorage from "@react-native-async-storage/async-storage"
import { AIProvider } from "@/types/ai"
import { AiContextState } from "@/stores/useAiContextStore"

const AI_PROVIDER_KEY = "app_aiProviderKey"
const AI_MODEL_DOWNLOADED_KEY = "app_aiModelDownloaded"
const AI_DOWNLOADED_MODELS_KEY = "app_aiDownloadedModels"

export const AI_MODEL_ID = "qwen3-0.6b-litert-v1"

export type LocalModelTier = "light" | "powerful"

export type LocalModel = {
    id: string
    name: string
    tier: LocalModelTier
    parameterCount: string
    quantization: string
    downloadUrl: string
    sha256: string
    sizeBytes: number
    contextWindow: number
    minRamBytes: number
    supportedPlatforms: ("ios" | "android")[]
    license: string
    blurb: string
}

export const LOCAL_MODELS: LocalModel[] = [
    {
        id: AI_MODEL_ID,
        name: "Qwen3 0.6B",
        tier: "light",
        parameterCount: "0.6B",
        quantization: "int4",
        downloadUrl:
            "https://huggingface.co/litert-community/Qwen3-0.6B/resolve/dd97997951bb15a2a71f539ba17f604707c0b11a/Qwen3-0.6B.litertlm",
        sha256: "555579ff2f4fd13379abe69c1c3ab5200f7338bc92471557f1d6614a6e5ab0b4",
        sizeBytes: 614_236_160,
        contextWindow: 4096,
        minRamBytes: 2_000_000_000,
        supportedPlatforms: ["ios", "android"],
        license: "Apache-2.0",
        blurb: "Fastest answers. Runs on any device.",
    },
    {
        id: "qwen3-1.7b-litert-v1",
        name: "Qwen3 1.7B",
        tier: "powerful",
        parameterCount: "1.7B",
        quantization: "int4",
        downloadUrl:
            "https://huggingface.co/litert-community/Qwen3-1.7B/resolve/73fbc3fe8271c162a603ee66f6e7ed25b6211195/Qwen3_1.7B.litertlm",
        sha256: "66064a4e9269cb693e124c4e3040bcb8a446b10bca42663896329495add3861c",
        sizeBytes: 2_056_729_520,
        contextWindow: 4096,
        minRamBytes: 4_000_000_000,
        supportedPlatforms: ["ios", "android"],
        license: "Apache-2.0",
        blurb: "Smarter answers. Needs about 2.1 GB and a newer phone.",
    },
]

export const TIER_LABELS: Record<LocalModelTier, string> = {
    light: "Light",
    powerful: "Powerful",
}

export const formatModelSize = (sizeBytes: number) => `${(sizeBytes / 1_000_000_000).toFixed(1)} GB`

const AI_SELECTED_MODEL_KEY = "app_aiSelectedModel"

export const getSelectedModelId = async (): Promise<string> => {
    try {
        const stored = await AsyncStorage.getItem(AI_SELECTED_MODEL_KEY)

        if (stored && LOCAL_MODELS.some((model) => model.id === stored)) {
            return stored
        }
    } catch {}

    return AI_MODEL_ID
}

export const setSelectedModelId = async (id: string): Promise<void> => {
    await AsyncStorage.setItem(AI_SELECTED_MODEL_KEY, id)
}

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

// checks if the given (or selected) local model is downloaded
export const isLocalModelDownloaded = async (modelId?: string): Promise<boolean> => {
    if (__DEV__) return false

    const id = modelId ?? (await getSelectedModelId())

    await registerLocalModels()

    try {
        const { getDownloadableModels } = await import("expo-ai-kit")
        const models = await getDownloadableModels()
        const model = models.find((entry) => entry.id === id)

        if (model) {
            const downloaded = ["downloaded", "loading", "ready"].includes(model.status)
            await setModelDownloadedFlag(id, downloaded)
            return downloaded
        }
    } catch (error) {
        console.error("Failed to read native AI model status:", error)
    }

    const ids = await getDownloadedModelIds()
    return ids.includes(id)
}

export async function downloadLocalModel(modelId?: string, onProgress?: (progress: number) => void) {
    if (__DEV__) return modelId ?? AI_MODEL_ID

    const id = modelId ?? (await getSelectedModelId())

    await registerLocalModels()
    const { downloadModel, deleteModel } = await import("expo-ai-kit")

    try {
        await downloadModel(id, { onProgress })
    } catch (error) {
        try {
            await deleteModel(id)
        } catch {}
        await setModelDownloadedFlag(id, false)
        throw error
    }

    await setModelDownloadedFlag(id, true)
    return id
}

export async function loadLocalModel(modelId?: string) {
    if (__DEV__) return

    const id = modelId ?? (await getSelectedModelId())

    await registerLocalModels()
    const { setModel } = await import("expo-ai-kit")

    await setModel(id, { generation: { temperature: 0.4, maxTokens: 512 } })
}

export async function restoreDownloadedModel(set: (partial: Partial<AiContextState>) => void) {
    try {
        const selectedId = await getSelectedModelId()

        // The file may have been deleted (storage cleanup, reinstall) since the provider was saved.
        if (!(await isLocalModelDownloaded(selectedId))) {
            await setAIProvider(null)
            set({ provider: null })
            return
        }

        await loadLocalModel(selectedId)
    } catch (error) {
        console.error("Failed to restore downloaded model:", error)
    }
}

export async function deleteLocalModel(modelId?: string) {
    if (__DEV__) return

    const id = modelId ?? (await getSelectedModelId())

    await registerLocalModels()
    const { deleteModel, unloadModel } = await import("expo-ai-kit")

    await unloadModel()
    await deleteModel(id)

    await setModelDownloadedFlag(id, false)
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
