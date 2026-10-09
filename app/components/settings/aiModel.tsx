import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native"
import { Bot, Cloud, Cpu, Trash2 } from "lucide-react-native"
import LiquidGlassView from "@/components/native/liquidGlassView"
import Accordion from "@/components/accordion"
import CustomSwitch from "@/components/customSwitch"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L } from "@/lib/theme"
import { AIProvider } from "@/types/ai"
import { useAiContextStore } from "@/stores/useAiContextStore"
import {
    deleteLocalModel,
    downloadLocalModel,
    isLocalModelDownloaded,
    loadLocalModel,
    supportsOnDeviceAI,
} from "@/lib/ai/settings"
import { formatTokens, loadTokenUsage, useTokenUsage } from "@/lib/ai/usage"
import { logsClient } from "@/lib/logs"

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error))

const getProviderLabel = (provider: AIProvider | null) => {
    switch (provider) {
        case "cloud":
            return "Cloud AI"

        case "built-in":
            return "Built-in AI"

        case "downloaded":
            return "Downloaded model"

        case "disabled":
            return "Disabled"

        default:
            return "No model"
    }
}

export default function AiModel() {
    const { vars, theme } = useThemes()
    const { provider, setProvider } = useAiContextStore()

    const [downloadingModel, setDownloadingModel] = useState(false)
    const [loadingModel, setLoadingModel] = useState(false)
    const [downloadProgress, setDownloadProgress] = useState(0)
    const [deletingModel, setDeletingModel] = useState(false)
    const [modelDownloaded, setModelDownloaded] = useState(false)
    const [supportsBuiltInAI, setSupportsBuiltInAI] = useState(false)
    const [checkingBuiltInSupport, setCheckingBuiltInSupport] = useState(true)
    const busyRef = useRef(false)

    const providerLabel = getProviderLabel(provider)
    const aiEnabled = provider !== "disabled"
    const expanded = provider !== "disabled"
    const isBusy = downloadingModel || loadingModel || deletingModel

    useEffect(() => {
        let mounted = true

        const initialize = async () => {
            try {
                const [downloaded, supported] = await Promise.all([
                    isLocalModelDownloaded(),
                    supportsOnDeviceAI(),
                    loadTokenUsage(),
                ])

                if (!mounted) {
                    return
                }

                setModelDownloaded(downloaded)
                setSupportsBuiltInAI(supported)
            } catch (error) {
                if (mounted) {
                    setModelDownloaded(false)
                    setSupportsBuiltInAI(false)
                }
            } finally {
                if (mounted) {
                    setCheckingBuiltInSupport(false)
                }
            }
        }

        initialize()

        return () => {
            mounted = false
        }
    }, [])

    const handleToggle = async () => {
        if (isBusy) {
            return
        }

        if (aiEnabled) {
            await setProvider("disabled")
            return
        }

        await setProvider(null)
    }

    const activateDownloadedModel = async () => {
        setLoadingModel(true)

        try {
            await loadLocalModel()
            await setProvider("downloaded")
        } catch (error) {
            const message = getErrorMessage(error)
            await logsClient.createLog(message, "GET", true)
        } finally {
            setLoadingModel(false)
        }
    }

    const handleSelectProvider = async (selectedProvider: AIProvider, enabled: boolean) => {
        if (busyRef.current || isBusy || checkingBuiltInSupport) {
            return
        }

        if (enabled === (provider === selectedProvider)) {
            return
        }

        busyRef.current = true

        try {
            // Turning the current provider off.
            if (!enabled) {
                if (selectedProvider === "downloaded" && provider === "downloaded") {
                    const { unloadModel } = await import("expo-ai-kit")
                    await unloadModel()
                }

                if (provider === selectedProvider) {
                    await setProvider(null)
                }

                return
            }

            // Switching away from the downloaded model should unload it.
            if (provider === "downloaded" && selectedProvider !== "downloaded") {
                const { unloadModel } = await import("expo-ai-kit")
                await unloadModel()
            }

            // Normal providers.
            if (selectedProvider !== "downloaded") {
                await setProvider(selectedProvider)
                return
            }

            // Downloaded model already exists.
            if (modelDownloaded) {
                await activateDownloadedModel()
                return
            }

            // Download model first.
            await handleDownloadedModel()
        } finally {
            busyRef.current = false
        }
    }

    const handleDownloadedModel = async () => {
        setDownloadingModel(true)
        setDownloadProgress(0)

        try {
            await downloadLocalModel((progress) => setDownloadProgress(progress))
            setModelDownloaded(true)
        } catch (error) {
            const message = getErrorMessage(error)
            await logsClient.createLog(message, "GET", true)
        } finally {
            setDownloadingModel(false)
            setDownloadProgress(0)
        }

        await activateDownloadedModel()
    }

    const handleDeleteDownloadedModel = async () => {
        if (busyRef.current || isBusy) {
            return
        }

        busyRef.current = true

        try {
            setDeletingModel(true)

            if (provider === "downloaded") {
                await setProvider(null)
            }

            await deleteLocalModel()

            setModelDownloaded(false)
        } catch (error) {
            const message = getErrorMessage(error)
            await logsClient.createLog(message, "GET", true)
        } finally {
            setDeletingModel(false)
            busyRef.current = false
        }
    }

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: vars.secondaryBackgroundColor,
                    borderColor: vars.secondaryBorderColor,
                },
            ]}
        >
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <LiquidGlassView style={styles.iconGlass}>
                        <View style={styles.iconWrapper}>
                            <Bot size={18} strokeWidth={2} color={vars.accentColor} />
                        </View>
                    </LiquidGlassView>

                    <View style={styles.textContainer}>
                        <Text
                            style={[
                                styles.title,
                                {
                                    color: vars.textColor,
                                },
                            ]}
                        >
                            AI Assistant
                        </Text>

                        <Text
                            style={[
                                styles.subtitle,
                                {
                                    color: theme === "light" ? "#6b7280" : "#9ca3af",
                                },
                            ]}
                            numberOfLines={1}
                        >
                            {downloadingModel
                                ? "Downloading AI model..."
                                : loadingModel
                                  ? "Loading AI model..."
                                  : deletingModel
                                    ? "Deleting AI model..."
                                    : provider === "disabled"
                                      ? "AI features are disabled"
                                      : provider
                                        ? `Using ${providerLabel}`
                                        : "Choose an AI model"}
                        </Text>
                    </View>
                </View>

                <CustomSwitch value={aiEnabled} onChange={handleToggle} disabled={isBusy} />
            </View>

            <Accordion expanded={expanded} style={styles.accordion}>
                <View style={styles.settingsList}>
                    <Text
                        style={[
                            styles.sectionDescription,
                            {
                                color: theme === "light" ? "#6b7280" : "#9ca3af",
                            },
                        ]}
                    >
                        Choose which AI model the assistant should use.
                    </Text>

                    <ProviderOption
                        icon={<Cloud size={18} color={vars.accentColor} />}
                        title="Cloud AI"
                        description="Use the online AI service."
                        selected={provider === "cloud"}
                        disabled={isBusy || checkingBuiltInSupport}
                        onPress={(enabled) => handleSelectProvider("cloud", enabled)}
                        footer={<TokenUsage />}
                    />

                    <ProviderOption
                        icon={<Cpu size={18} color={vars.accentColor} />}
                        title="Built-in AI"
                        description={
                            checkingBuiltInSupport
                                ? "Checking device support..."
                                : !supportsBuiltInAI
                                  ? "Built-in AI is not supported on this device."
                                  : "Use the AI model provided by the device."
                        }
                        selected={provider === "built-in"}
                        disabled={checkingBuiltInSupport || isBusy || !supportsBuiltInAI}
                        onPress={(enabled) => handleSelectProvider("built-in", enabled)}
                    />

                    <ProviderOption
                        icon={
                            downloadingModel || loadingModel ? (
                                <ActivityIndicator size="small" color={vars.accentColor} />
                            ) : (
                                <Bot size={18} color={vars.accentColor} />
                            )
                        }
                        title="Downloaded model"
                        description={
                            downloadingModel
                                ? `Downloading AI model... ${Math.round(downloadProgress * 100)}%`
                                : loadingModel
                                  ? "Loading AI model into memory..."
                                  : modelDownloaded
                                    ? "AI model is stored on this device."
                                    : "Download an AI model to this device. Requires about 0.5 GB of storage."
                        }
                        selected={provider === "downloaded"}
                        loading={downloadingModel}
                        progress={downloadingModel ? downloadProgress : undefined}
                        disabled={isBusy}
                        onPress={(enabled) => handleSelectProvider("downloaded", enabled)}
                    />

                    {modelDownloaded && (
                        <DeleteModelOption
                            deleting={deletingModel}
                            disabled={isBusy}
                            onPress={handleDeleteDownloadedModel}
                        />
                    )}
                </View>
            </Accordion>
        </View>
    )
}

function TokenUsage() {
    const { vars, theme } = useThemes()
    const { totalTokens, window } = useTokenUsage()

    const used = window ? Math.max(0, window.limit - window.remaining) : 0
    const fraction = window && window.limit > 0 ? Math.min(1, used / window.limit) : 0
    const subColor = theme === "light" ? "#6b7280" : "#9ca3af"

    return (
        <View style={styles.usage}>
            {window ? (
                <>
                    <View style={[styles.progressTrack, { backgroundColor: vars.secondaryBorderColor, marginTop: 0 }]}>
                        <View
                            style={[
                                styles.progressFill,
                                { backgroundColor: vars.accentColor, width: `${Math.round(fraction * 100)}%` },
                            ]}
                        />
                    </View>
                    <Text style={[styles.usageText, { color: vars.textColor }]}>
                        {formatTokens(used)} of {formatTokens(window.limit)} tokens used
                    </Text>
                    <Text style={[styles.usageSub, { color: subColor }]}>
                        {window.reset ? `Resets in ${window.reset} • ` : ""}
                        {formatTokens(totalTokens)} lifetime tokens
                    </Text>
                </>
            ) : totalTokens > 0 ? (
                <Text style={[styles.usageSub, { color: subColor }]}>
                    {formatTokens(totalTokens)} lifetime tokens • window usage appears after your next chat
                </Text>
            ) : (
                <Text style={[styles.usageSub, { color: subColor }]}>
                    Token usage appears here after your first chat.
                </Text>
            )}
        </View>
    )
}

function ProviderOption({
    icon,
    title,
    description,
    selected,
    loading = false,
    progress,
    disabled = false,
    onPress,
    footer,
}: {
    icon: React.ReactNode
    title: string
    description: string
    selected: boolean
    loading?: boolean
    progress?: number
    disabled?: boolean
    onPress: (enabled: boolean) => void | Promise<void>
    footer?: React.ReactNode
}) {
    const { vars, theme } = useThemes()

    return (
        <View
            style={[
                styles.option,
                {
                    backgroundColor: selected ? `${vars.accentColor}12` : vars.backgroundColor,
                    borderColor: selected ? vars.accentColor : vars.secondaryBorderColor,
                    opacity: disabled && !loading ? 0.5 : 1,
                },
            ]}
        >
            <View style={styles.optionIcon}>{icon}</View>

            <View style={styles.optionText}>
                <Text
                    style={[
                        styles.optionTitle,
                        {
                            color: vars.textColor,
                        },
                    ]}
                >
                    {title}
                </Text>

                <Text
                    style={[
                        styles.optionDescription,
                        {
                            color: theme === "light" ? "#6b7280" : "#9ca3af",
                        },
                    ]}
                >
                    {description}
                </Text>

                {loading && progress !== undefined && (
                    <View
                        style={[
                            styles.progressTrack,
                            {
                                backgroundColor: vars.secondaryBorderColor,
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.progressFill,
                                {
                                    backgroundColor: vars.accentColor,
                                    width: `${Math.round(progress * 100)}%`,
                                },
                            ]}
                        />
                    </View>
                )}

                {footer}
            </View>

            <CustomSwitch
                value={selected}
                onChange={(enabled) => {
                    if (enabled === selected) {
                        return
                    }

                    void onPress(enabled)
                }}
                disabled={disabled}
            />
        </View>
    )
}

function DeleteModelOption({
    deleting,
    disabled,
    onPress,
}: {
    deleting: boolean
    disabled: boolean
    onPress: () => void | Promise<void>
}) {
    const { vars, theme } = useThemes()

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled || deleting}
            style={({ pressed }) => [
                styles.deleteOption,
                {
                    backgroundColor: vars.backgroundColor,
                    borderColor: vars.secondaryBorderColor,
                    opacity: disabled && !deleting ? 0.5 : pressed ? 0.7 : 1,
                },
            ]}
        >
            <View style={styles.deleteIcon}>
                {deleting ? (
                    <ActivityIndicator size="small" color={vars.accentColor} />
                ) : (
                    <Trash2 size={18} color={vars.accentColor} />
                )}
            </View>

            <View style={styles.optionText}>
                <Text
                    style={[
                        styles.optionTitle,
                        {
                            color: vars.textColor,
                        },
                    ]}
                >
                    {deleting ? "Deleting model..." : "Delete downloaded model"}
                </Text>

                <Text
                    style={[
                        styles.optionDescription,
                        {
                            color: theme === "light" ? "#6b7280" : "#9ca3af",
                        },
                    ]}
                >
                    Remove the local AI model to free storage.
                </Text>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BORDER_RADIUS_L,
        marginHorizontal: 8,
        paddingHorizontal: 18,
        paddingTop: 18,
        borderWidth: 1,
        overflow: "hidden",
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 14,
    },

    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
    },

    textContainer: {
        flex: 1,
    },

    iconGlass: {
        width: 42,
        height: 42,
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },

    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: BORDER_RADIUS_FULL,
        justifyContent: "center",
        alignItems: "center",
    },

    title: {
        fontSize: 18,
        fontWeight: "700",
    },

    subtitle: {
        fontSize: 13,
        marginTop: 2,
    },

    accordion: {
        marginTop: 20,
    },

    settingsList: {
        gap: 12,
    },

    sectionDescription: {
        fontSize: 13,
        marginBottom: 2,
    },

    option: {
        minHeight: 68,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    deleteOption: {
        minHeight: 68,
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },

    optionIcon: {
        width: 38,
        height: 38,
        borderRadius: BORDER_RADIUS_FULL,
        justifyContent: "center",
        alignItems: "center",
    },

    deleteIcon: {
        width: 38,
        height: 38,
        borderRadius: BORDER_RADIUS_FULL,
        justifyContent: "center",
        alignItems: "center",
    },

    optionText: {
        flex: 1,
    },

    optionTitle: {
        fontSize: 15,
        fontWeight: "600",
    },

    optionDescription: {
        fontSize: 12,
        marginTop: 2,
        lineHeight: 17,
    },

    progressTrack: {
        height: 4,
        borderRadius: 2,
        overflow: "hidden",
        marginTop: 8,
    },

    progressFill: {
        height: "100%",
        borderRadius: 2,
    },

    usage: {
        marginTop: 10,
        gap: 4,
    },

    usageText: {
        fontSize: 13,
        fontWeight: "600",
    },

    usageSub: {
        fontSize: 11,
    },
})
