import { RefObject, useEffect, useState } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import AppBottomSheet, { BottomSheetRef } from "@/components/native/bottom-sheet/appBottomSheet"
import FormError from "@/components/native/formError"
import ChatView from "@/components/ai/chatView"
import ProviderSetup from "./providerSetup"
import useThemes from "@/hooks/themes/useThemes"
import { useAiContextStore } from "@/stores/useAiContextStore"
import { AIProvider } from "@/types/ai"
import { logsClient } from "@/lib/logs"

type Props = {
    pathname: string
    sheetRef: RefObject<BottomSheetRef | null>
    onClose: () => void
}

const SNAP_POINTS = ["55%", "75%", "100%"]

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))

const logError = (error: unknown) => logsClient.createLog(getErrorMessage(error), "GET", true)

export default function AiChatBottomSheet({ pathname, sheetRef, onClose }: Props) {
    const { vars } = useThemes()

    const provider = useAiContextStore((state) => state.provider)
    const loadProvider = useAiContextStore((state) => state.loadProvider)
    const setProvider = useAiContextStore((state) => state.setProvider)

    const [checking, setChecking] = useState(true)
    const [switching, setSwitching] = useState(false)
    const [error, setError] = useState<string | null>(null)

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

    const handleProviderSelected = async (selectedProvider: AIProvider) => {
        setSwitching(true)
        setError(null)

        try {
            await setProvider(selectedProvider)
        } catch (selectError) {
            await logError(selectError)
            setError("Could not switch the AI model. Please try again.")
        } finally {
            setSwitching(false)
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
            {checking || switching ? (
                <View style={styles.center}>
                    <ActivityIndicator size="small" />
                    <Text style={[styles.text, { color: vars.textColor }]}>
                        {checking ? "Checking AI setup…" : "Switching AI model…"}
                    </Text>
                </View>
            ) : provider === null ? (
                <>
                    <View style={styles.errorWrap}>
                        <FormError message={error} onDismiss={() => setError(null)} />
                    </View>
                    <ProviderSetup onSelectProvider={handleProviderSelected} />
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
})
