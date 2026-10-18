import { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { Bot, Cloud, Cpu } from "lucide-react-native"
import LiquidGlassView from "@/components/native/liquidGlassView"
import Accordion from "@/components/accordion"
import CustomSwitch from "@/components/customSwitch"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L } from "@/lib/theme"
import { AIProvider } from "@/types/ai"
import { useAiContextStore } from "@/stores/useAiContextStore"
import { supportsOnDeviceAI } from "@/lib/ai/settings"
import { CLOUD_PROVIDERS } from "@/lib/ai/cloudProviders"
import { formatTokens, loadTokenUsage, useTokenUsage } from "@/lib/ai/usage"

const getProviderLabel = (provider: AIProvider | null) => {
    switch (provider) {
        case "cloud":
            return "Cloud AI"

        case "built-in":
            return "Built-in AI"

        case "disabled":
            return "Disabled"

        default:
            return "No model"
    }
}

export default function AiModel() {
    const { vars, theme } = useThemes()
    const { provider, setProvider } = useAiContextStore()

    const [supportsBuiltInAI, setSupportsBuiltInAI] = useState(false)
    const [checkingBuiltInSupport, setCheckingBuiltInSupport] = useState(true)

    const aiEnabled = provider !== "disabled"
    const expanded = provider !== "disabled"
    const subColor = theme === "light" ? "#6b7280" : "#9ca3af"

    useEffect(() => {
        let mounted = true

        const initialize = async () => {
            try {
                const supported = await supportsOnDeviceAI()

                if (mounted) {
                    setSupportsBuiltInAI(supported)
                }
            } catch (error) {
                if (mounted) {
                    setSupportsBuiltInAI(false)
                }
            } finally {
                if (mounted) {
                    setCheckingBuiltInSupport(false)
                }
            }
        }

        initialize()
        loadTokenUsage()

        return () => {
            mounted = false
        }
    }, [])

    const handleToggle = async () => {
        if (aiEnabled) {
            await setProvider("disabled")
            return
        }

        await setProvider(null)
    }

    const handleSelectProvider = async (selectedProvider: AIProvider, enabled: boolean) => {
        if (enabled === (provider === selectedProvider)) {
            return
        }

        if (enabled) {
            await setProvider(selectedProvider)
        } else {
            await setProvider(null)
        }
    }

    const builtInDescription = checkingBuiltInSupport
        ? "Checking device support..."
        : supportsBuiltInAI
          ? "Use the AI model provided by the device."
          : "Built-in AI is not supported on this device."

    // Name the providers we can actually reach, so the row reflects reality
    // rather than assuming every service is wired up.
    const hasCloudKey = CLOUD_PROVIDERS.some((entry) => entry.apiKey)
    const cloudDescription = hasCloudKey
        ? "Free cloud AI with automatic fallback when one is busy."
        : "No cloud provider key found."

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
                            {provider === "disabled"
                                ? "AI features are disabled"
                                : provider
                                  ? `Using ${getProviderLabel(provider)}`
                                  : "Choose an AI"}
                        </Text>
                    </View>
                </View>

                <CustomSwitch value={aiEnabled} onChange={handleToggle} />
            </View>

            <Accordion expanded={expanded} style={styles.accordion}>
                <View style={styles.settingsList}>
                    <Text style={[styles.sectionDescription, { color: subColor }]}>
                        Choose which AI the assistant should use.
                    </Text>

                    <ProviderOption
                        icon={<Cloud size={18} color={vars.accentColor} />}
                        title="Cloud AI"
                        description={cloudDescription}
                        selected={provider === "cloud"}
                        disabled={checkingBuiltInSupport}
                        onPress={(enabled) => handleSelectProvider("cloud", enabled)}
                        footer={<TokenUsage />}
                    />

                    <ProviderOption
                        icon={<Cpu size={18} color={vars.accentColor} />}
                        title="Built-in AI"
                        description={builtInDescription}
                        selected={provider === "built-in"}
                        disabled={checkingBuiltInSupport || !supportsBuiltInAI}
                        onPress={(enabled) => handleSelectProvider("built-in", enabled)}
                    />
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
                        {window.reset ? `Resets in ${window.reset} - ` : ""}
                        {formatTokens(totalTokens)} lifetime tokens
                    </Text>
                </>
            ) : totalTokens > 0 ? (
                <Text style={[styles.usageSub, { color: subColor }]}>
                    {formatTokens(totalTokens)} lifetime tokens - window usage appears after your next chat
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

    optionIcon: {
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
