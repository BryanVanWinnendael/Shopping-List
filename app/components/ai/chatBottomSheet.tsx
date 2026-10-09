import { RefObject, useEffect, useState } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import AppBottomSheet, { BottomSheetRef } from "@/components/native/bottom-sheet/appBottomSheet"
import FormError from "@/components/native/formError"
import ChatView from "@/components/ai/chatView"
import ProviderSetup from "./providerSetup"
import useThemes from "@/hooks/themes/useThemes"
import { useAiContextStore } from "@/stores/useAiContextStore"
import { AIProvider } from "@/types/ai"
import { downloadLocalModel, isLocalModelDownloaded, loadLocalModel } from "@/lib/ai/settings"
import { logsClient } from "@/lib/logs"

type Props = {
    pathname: string
    sheetRef: RefObject<BottomSheetRef | null>
    onClose: () => void
}

type Status = "idle" | "downloading" | "loading"

const SNAP_POINTS = ["55%", "75%", "100%"]

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))

const logError = (error: unknown) => logsClient.createLog(getErrorMessage(error), "GET", true)

export default function AiChatBottomSheet({ pathname, sheetRef, onClose }: Props) {
    const { vars } = useThemes()

    const provider = useAiContextStore((state) => state.provider)
    const loadProvider = useAiContextStore((state) => state.loadProvider)
    const setProvider = useAiContextStore((state) => state.setProvider)

    const [checking, setChecking] = useState(true)
    const [status, setStatus] = useState<Status>("idle")
    const [downloadProgress, setDownloadProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)

    const isDownloading = status === "downloading"
    const isBusy = status !== "idle"

    useEffect(() => {
        let mounted = true

        loadProvider()
            .catch(logError)
            .finally(() => {
                if (mounted) setChecking(false)
            })

        return () => {
            mounted = false
        }
    }, [loadProvider])

    // Load the downloaded model into memory (once per launch), then select it.
    const activateDownloadedModel = async () => {
        setStatus("loading")

        try {
            await loadLocalModel()
            await setProvider("downloaded")
        } catch (error) {
            await logsClient.createLog(getErrorMessage(error), "GET", true)
        } finally {
            setStatus("idle")
        }
    }

    const downloadAndActivate = async () => {
        setStatus("downloading")
        setDownloadProgress(0)
        setError(null)

        try {
            await downloadLocalModel(setDownloadProgress)
        } catch (error) {
            await logError(error)
            setError("Model download failed. Check your connection and try again.")
            setStatus("idle")
            return
        }

        // A load failure must not undo a successful download.
        await activateDownloadedModel()
    }

    const handleProviderSelected = async (selectedProvider: AIProvider) => {
        if (selectedProvider !== "downloaded") {
            await setProvider(selectedProvider)
            return
        }

        // Check at tap time. The model may have been downloaded or deleted in Settings
        // since this sheet mounted, so a value cached on mount could be stale.
        const downloaded = await isLocalModelDownloaded().catch(() => false)

        if (downloaded) {
            await activateDownloadedModel()
        } else {
            await downloadAndActivate()
        }
    }

    return (
        <AppBottomSheet
            ref={sheetRef}
            index={-1}
            snapPoints={SNAP_POINTS}
            enablePanDownToClose
            onClose={onClose}
            backgroundMode="adaptive"
        >
            {checking ? (
                <View style={styles.center}>
                    <ActivityIndicator size="small" />
                    <Text style={[styles.text, { color: vars.textColor }]}>Checking AI setup…</Text>
                </View>
            ) : isBusy ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" />
                    <Text style={[styles.text, { color: vars.textColor }]}>
                        {isDownloading ? "Downloading AI model…" : "Loading AI model…"}
                    </Text>
                    {isDownloading && (
                        <Text style={[styles.progress, { color: vars.textColor }]}>
                            {Math.round(downloadProgress * 100)}%
                        </Text>
                    )}
                </View>
            ) : provider === null ? (
                <>
                    <View style={styles.errorWrap}>
                        <FormError message={error} onDismiss={() => setError(null)} />
                    </View>
                    <ProviderSetup
                        onSelectProvider={handleProviderSelected}
                        onDownloadModel={downloadAndActivate}
                        downloadingModel={isDownloading}
                    />
                </>
            ) : (
                <ChatView pathname={pathname} provider={provider} />
            )}
        </AppBottomSheet>
    )
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    errorWrap: {
        paddingHorizontal: 20,
    },
    text: {
        fontSize: 14,
        fontWeight: "500",
    },
    progress: {
        fontSize: 13,
        fontWeight: "600",
    },
})
