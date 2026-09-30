import AppBottomSheet, { BottomSheetRef } from "@/components/native/bottom-sheet/appBottomSheet"
import useThemes from "@/hooks/themes/useThemes"
import { RefObject, useEffect, useState } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import ProviderSetup from "./providerSetup"
import { useAiContextStore } from "@/stores/useAiContextStore"
import ChatView from "@/components/ai/chatView"
import { AIProvider } from "@/types/ai"
import { AI_MODEL_ID, downloadLocalModel, isLocalModelDownloaded, loadLocalModel } from "@/lib/ai/settings"

type Props = {
    pathname: string
    sheetRef: RefObject<BottomSheetRef | null>
    onClose: () => void
}

export default function AiChatBottomSheet({ pathname, sheetRef, onClose }: Props) {
    const { vars } = useThemes()

    const provider = useAiContextStore((state) => state.provider)
    const loadProvider = useAiContextStore((state) => state.loadProvider)
    const setProvider = useAiContextStore((state) => state.setProvider)

    const [loadingProvider, setLoadingProvider] = useState(true)
    const [downloadingModel, setDownloadingModel] = useState(false)
    const [downloadProgress, setDownloadProgress] = useState(0)
    const [modelDownloaded, setModelDownloaded] = useState(false)

    useEffect(() => {
        let mounted = true

        const initializeProvider = async () => {
            try {
                await Promise.all([
                    loadProvider(),
                    isLocalModelDownloaded().then((downloaded) => {
                        if (mounted) {
                            setModelDownloaded(downloaded)
                        }
                    }),
                ])
            } finally {
                if (mounted) {
                    setLoadingProvider(false)
                }
            }
        }

        initializeProvider()

        return () => {
            mounted = false
        }
    }, [loadProvider])

    const handleProviderSelected = async (selectedProvider: AIProvider) => {
        if (downloadingModel) {
            return
        }

        // Downloaded model was selected.
        if (selectedProvider === "downloaded") {
            if (modelDownloaded) {
                const { setModel } = await import("expo-ai-kit")

                await setModel(AI_MODEL_ID, {
                    generation: {
                        temperature: 0.7,
                        maxTokens: 512,
                    },
                })

                await setProvider("downloaded")
                return
            }

            // Model doesn't exist yet, so download and activate it.
            await handleDownloadModel()
            return
        }

        // Switching away from the downloaded model unloads it
        // from memory, but does not delete the downloaded file.
        if (provider === "downloaded") {
            const { unloadModel } = await import("expo-ai-kit")
            await unloadModel()
        }

        await setProvider(selectedProvider)
    }

    const handleDownloadModel = async () => {
        if (downloadingModel) {
            return
        }

        setDownloadingModel(true)
        setDownloadProgress(0)

        try {
            await downloadLocalModel((progress) => setDownloadProgress(progress))
            setModelDownloaded(true)
        } catch (error) {
            console.error("Failed to download AI model:", error)
            setDownloadingModel(false)
            setDownloadProgress(0)
            return
        }

        try {
            await loadLocalModel()
            await setProvider("downloaded")
        } catch (error) {
            console.error("Downloaded, but failed to load AI model:", error)
        } finally {
            setDownloadingModel(false)
            setDownloadProgress(0)
        }
    }

    return (
        <AppBottomSheet
            ref={sheetRef}
            index={-1}
            snapPoints={["55%", "75%", "100%"]}
            enablePanDownToClose
            onClose={onClose}
            backgroundMode="adaptive"
        >
            {loadingProvider ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" />

                    <Text
                        style={[
                            styles.loadingText,
                            {
                                color: vars.textColor,
                            },
                        ]}
                    >
                        Checking AI setup…
                    </Text>
                </View>
            ) : downloadingModel ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />

                    <Text
                        style={[
                            styles.loadingText,
                            {
                                color: vars.textColor,
                            },
                        ]}
                    >
                        Downloading AI model…
                    </Text>

                    <Text
                        style={[
                            styles.progressText,
                            {
                                color: vars.textColor,
                            },
                        ]}
                    >
                        {Math.round(downloadProgress * 100)}%
                    </Text>
                </View>
            ) : provider === null ? (
                <ProviderSetup
                    onSelectProvider={handleProviderSelected}
                    onDownloadModel={handleDownloadModel}
                    downloadingModel={downloadingModel}
                />
            ) : (
                <ChatView pathname={pathname} provider={provider} />
            )}
        </AppBottomSheet>
    )
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },

    loadingText: {
        fontSize: 14,
        fontWeight: "500",
    },

    progressText: {
        fontSize: 13,
        fontWeight: "600",
    },
})
