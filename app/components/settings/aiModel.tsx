import React, { useEffect, useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native"
import { Bot, Cloud, Cpu, Trash2 } from "lucide-react-native"
import { GlassView } from "expo-glass-effect"
import Accordion from "@/components/accordion"
import CustomSwitch from "@/components/customSwitch"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L } from "@/lib/theme"
import { AIProvider } from "@/types/ai"
import { useAiContextStore } from "@/stores/useAiContextStore"
import {
    AI_MODEL_ID,
    deleteLocalModel,
    downloadLocalModel,
    isLocalModelDownloaded,
    supportsOnDeviceAI,
} from "@/lib/ai/settings"

function getProviderLabel(provider: AIProvider | null) {
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
    const [deletingModel, setDeletingModel] = useState(false)
    const [modelDownloaded, setModelDownloaded] = useState(false)
    const [supportsBuiltInAI, setSupportsBuiltInAI] = useState(false)
    const [checkingBuiltInSupport, setCheckingBuiltInSupport] = useState(true)

    const colorScheme = theme === "light" ? "light" : "dark"
    const providerLabel = getProviderLabel(provider)
    const aiEnabled = provider !== "disabled"
    const expanded = provider !== "disabled"

    useEffect(() => {
        let mounted = true

        const initialize = async () => {
            try {
                const [downloaded, supported] = await Promise.all([isLocalModelDownloaded(), supportsOnDeviceAI()])

                if (!mounted) {
                    return
                }

                setModelDownloaded(downloaded)
                setSupportsBuiltInAI(supported)
            } catch (error) {
                console.error("Failed to initialize AI model settings:", error)

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
        if (downloadingModel || deletingModel) {
            return
        }

        if (aiEnabled) {
            await setProvider("disabled")
            return
        }

        await setProvider(null)
    }

    const handleSelectProvider = async (selectedProvider: AIProvider) => {
        if (downloadingModel || deletingModel || checkingBuiltInSupport) {
            return
        }

        // Built-in AI requires device support.
        if (selectedProvider === "built-in" && !supportsBuiltInAI) {
            return
        }

        // Tapping the currently selected provider toggles it off.
        if (provider === selectedProvider) {
            if (selectedProvider === "downloaded") {
                const { unloadModel } = await import("expo-ai-kit")
                await unloadModel()
            }

            await setProvider(null)
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

        // Download model first.
        await handleDownloadedModel()
    }

    const handleDownloadedModel = async () => {
        if (downloadingModel || deletingModel) {
            return
        }

        try {
            setDownloadingModel(true)

            await downloadLocalModel((progress) => {
                console.log(`Downloading model: ${Math.round(progress * 100)}%`)
            })

            setModelDownloaded(true)

            await setProvider("downloaded")
        } catch (error) {
            console.error("Failed to download AI model:", error)
        } finally {
            setDownloadingModel(false)
        }
    }

    const handleDeleteDownloadedModel = async () => {
        if (downloadingModel || deletingModel) {
            return
        }

        try {
            setDeletingModel(true)

            if (provider === "downloaded") {
                const { unloadModel } = await import("expo-ai-kit")

                await unloadModel()
                await setProvider(null)
            }

            await deleteLocalModel()

            setModelDownloaded(false)
        } catch (error) {
            console.error("Failed to delete AI model:", error)
        } finally {
            setDeletingModel(false)
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
                    <GlassView
                        glassEffectStyle="regular"
                        colorScheme={colorScheme}
                        isInteractive={false}
                        style={styles.iconGlass}
                    >
                        <View style={styles.iconWrapper}>
                            <Bot size={18} strokeWidth={2} color={vars.accentColor} />
                        </View>
                    </GlassView>

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

                <CustomSwitch value={aiEnabled} onChange={handleToggle} disabled={downloadingModel || deletingModel} />
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
                        disabled={downloadingModel || deletingModel || checkingBuiltInSupport}
                        onPress={() => handleSelectProvider("cloud")}
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
                        disabled={checkingBuiltInSupport || downloadingModel || deletingModel || !supportsBuiltInAI}
                        onPress={() => handleSelectProvider("built-in")}
                    />

                    <ProviderOption
                        icon={
                            downloadingModel ? (
                                <ActivityIndicator size="small" color={vars.accentColor} />
                            ) : (
                                <Bot size={18} color={vars.accentColor} />
                            )
                        }
                        title="Downloaded model"
                        description={
                            downloadingModel
                                ? "Downloading AI model..."
                                : modelDownloaded
                                  ? "AI model is stored on this device."
                                  : "Download an AI model to this device. Requires about 0.5 GB of storage."
                        }
                        selected={provider === "downloaded"}
                        loading={downloadingModel}
                        disabled={downloadingModel || deletingModel}
                        onPress={() => handleSelectProvider("downloaded")}
                    />

                    {modelDownloaded && (
                        <DeleteModelOption
                            deleting={deletingModel}
                            disabled={downloadingModel}
                            onPress={handleDeleteDownloadedModel}
                        />
                    )}
                </View>
            </Accordion>
        </View>
    )
}

function ProviderOption({
    icon,
    title,
    description,
    selected,
    loading = false,
    disabled = false,
    onPress,
}: {
    icon: React.ReactNode
    title: string
    description: string
    selected: boolean
    loading?: boolean
    disabled?: boolean
    onPress: () => void | Promise<void>
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
            </View>

            <CustomSwitch value={selected} onChange={onPress} disabled={disabled} />
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
        overflow: "hidden",
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
})
