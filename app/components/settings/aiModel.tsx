import { useEffect, useRef, useState } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { PressableScale } from "pressto"
import { Bot, Cloud, Cpu, Trash2 } from "lucide-react-native"
import LiquidGlassView from "@/components/native/liquidGlassView"
import Accordion from "@/components/accordion"
import CustomSwitch from "@/components/customSwitch"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L } from "@/lib/theme"
import { AIProvider } from "@/types/ai"
import { useAiContextStore } from "@/stores/useAiContextStore"
import {
    AI_MODEL_ID,
    LOCAL_MODELS,
    TIER_LABELS,
    deleteLocalModel,
    downloadLocalModel,
    formatModelSize,
    getDownloadedModelIds,
    getSelectedModelId,
    isLocalModelDownloaded,
    loadLocalModel,
    setSelectedModelId,
    supportsOnDeviceAI,
} from "@/lib/ai/settings"
import type { LocalModel } from "@/lib/ai/settings"
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

    const [downloadProgress, setDownloadProgress] = useState(0)
    const [downloadedIds, setDownloadedIds] = useState<string[]>([])
    const [selectedModelId, setSelectedModelIdState] = useState<string>(AI_MODEL_ID)
    const [busy, setBusy] = useState<{ id: string; kind: "download" | "load" | "delete" } | null>(null)
    const [supportsBuiltInAI, setSupportsBuiltInAI] = useState(false)
    const [checkingBuiltInSupport, setCheckingBuiltInSupport] = useState(true)
    const busyRef = useRef(false)

    const providerLabel = getProviderLabel(provider)
    const aiEnabled = provider !== "disabled"
    const expanded = provider !== "disabled"
    const isBusy = busy !== null
    const subColor = theme === "light" ? "#6b7280" : "#9ca3af"
    const activeModel = LOCAL_MODELS.find((model) => model.id === selectedModelId)

    useEffect(() => {
        let mounted = true

        const initialize = async () => {
            try {
                const [supported, ids, selectedId] = await Promise.all([
                    supportsOnDeviceAI(),
                    getDownloadedModelIds(),
                    getSelectedModelId(),
                    loadTokenUsage(),
                ])

                if (!mounted) {
                    return
                }

                // Native status is the source of truth; fall back to stored flags.
                const verified = (
                    await Promise.all(ids.map(async (id) => ((await isLocalModelDownloaded(id)) ? id : null)))
                ).filter((id): id is string => id !== null)

                if (!mounted) {
                    return
                }

                setDownloadedIds(verified)
                setSelectedModelIdState(selectedId)
                setSupportsBuiltInAI(supported)
            } catch (error) {
                if (mounted) {
                    setDownloadedIds([])
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

    const selectModel = async (model: LocalModel) => {
        if (busyRef.current || isBusy) {
            return
        }

        const downloaded = downloadedIds.includes(model.id)

        busyRef.current = true
        setBusy({ id: model.id, kind: downloaded ? "load" : "download" })
        setDownloadProgress(0)

        try {
            if (!downloaded) {
                await downloadLocalModel(model.id, (progress) => setDownloadProgress(progress))
                setDownloadedIds((ids) => [...ids, model.id])
            }

            await setSelectedModelId(model.id)
            setSelectedModelIdState(model.id)
            await loadLocalModel(model.id)
            await setProvider("downloaded")
        } catch (error) {
            const message = getErrorMessage(error)
            await logsClient.createLog(message, "GET", true)
        } finally {
            setBusy(null)
            setDownloadProgress(0)
            busyRef.current = false
        }
    }

    const deleteModel = async (model: LocalModel) => {
        if (busyRef.current || isBusy) {
            return
        }

        busyRef.current = true
        setBusy({ id: model.id, kind: "delete" })

        try {
            if (provider === "downloaded" && selectedModelId === model.id) {
                const { unloadModel } = await import("expo-ai-kit")
                await unloadModel()
                await setProvider(null)
            }

            await deleteLocalModel(model.id)
            setDownloadedIds((ids) => ids.filter((id) => id !== model.id))
        } catch (error) {
            const message = getErrorMessage(error)
            await logsClient.createLog(message, "GET", true)
        } finally {
            setBusy(null)
            busyRef.current = false
        }
    }

    const deselectModel = async () => {
        if (busyRef.current || isBusy) {
            return
        }

        busyRef.current = true

        try {
            const { unloadModel } = await import("expo-ai-kit")
            await unloadModel()
            await setProvider(null)
        } catch (error) {
            const message = getErrorMessage(error)
            await logsClient.createLog(message, "GET", true)
        } finally {
            busyRef.current = false
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
                if (provider === selectedProvider) {
                    if (provider === "downloaded") {
                        const { unloadModel } = await import("expo-ai-kit")
                        await unloadModel()
                    }

                    await setProvider(null)
                }

                return
            }

            // Switching away from the downloaded model should unload it.
            if (provider === "downloaded" && selectedProvider !== "downloaded") {
                const { unloadModel } = await import("expo-ai-kit")
                await unloadModel()
            }

            await setProvider(selectedProvider)
        } finally {
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
                            {busy
                                ? busy.kind === "download"
                                    ? "Downloading AI model..."
                                    : busy.kind === "load"
                                      ? "Loading AI model..."
                                      : "Deleting AI model..."
                                : provider === "disabled"
                                  ? "AI features are disabled"
                                  : provider === "downloaded" && activeModel
                                    ? `Using ${activeModel.name}`
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

                    <Text style={[styles.sectionDescription, { color: subColor }]}>
                        On-device models run privately without internet.
                    </Text>

                    {LOCAL_MODELS.map((model) => (
                        <ModelRow
                            key={model.id}
                            model={model}
                            downloaded={downloadedIds.includes(model.id)}
                            active={provider === "downloaded" && selectedModelId === model.id}
                            busy={busy?.id === model.id ? busy.kind : null}
                            progress={downloadProgress}
                            disabled={isBusy}
                            onSelect={() => selectModel(model)}
                            onDeselect={deselectModel}
                            onDelete={() => deleteModel(model)}
                        />
                    ))}
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

function ModelRow({
    model,
    downloaded,
    active,
    busy,
    progress,
    disabled,
    onSelect,
    onDeselect,
    onDelete,
}: {
    model: LocalModel
    downloaded: boolean
    active: boolean
    busy: "download" | "load" | "delete" | null
    progress: number
    disabled: boolean
    onSelect: () => void
    onDeselect: () => void
    onDelete: () => void
}) {
    const { vars, theme } = useThemes()
    const subColor = theme === "light" ? "#6b7280" : "#9ca3af"

    const status =
        busy === "download"
            ? `Downloading... ${Math.round(progress * 100)}%`
            : busy === "load"
              ? "Loading into memory..."
              : busy === "delete"
                ? "Deleting..."
                : downloaded
                  ? active
                      ? "In use • Stored on this device"
                      : "Stored on this device"
                  : `${formatModelSize(model.sizeBytes)} • ${model.blurb}`

    return (
        <View
            style={[
                styles.option,
                {
                    backgroundColor: active ? `${vars.accentColor}12` : vars.backgroundColor,
                    borderColor: active ? vars.accentColor : vars.secondaryBorderColor,
                    opacity: disabled && !busy ? 0.5 : 1,
                },
            ]}
        >
            <View style={styles.optionIcon}>
                {busy ? (
                    <ActivityIndicator size="small" color={vars.accentColor} />
                ) : (
                    <Bot size={18} color={vars.accentColor} />
                )}
            </View>

            <View style={styles.optionText}>
                <View style={styles.modelTitleRow}>
                    <Text style={[styles.optionTitle, { color: vars.textColor }]} numberOfLines={1}>
                        {model.name}
                    </Text>
                    <View style={[styles.tierPill, { backgroundColor: `${vars.accentColor}1f` }]}>
                        <Text style={[styles.tierText, { color: vars.accentColor }]}>{TIER_LABELS[model.tier]}</Text>
                    </View>
                </View>

                <Text style={[styles.optionDescription, { color: subColor }]} numberOfLines={2}>
                    {status}
                </Text>

                {busy === "download" && (
                    <View style={[styles.progressTrack, { backgroundColor: vars.secondaryBorderColor }]}>
                        <View
                            style={[
                                styles.progressFill,
                                { backgroundColor: vars.accentColor, width: `${Math.round(progress * 100)}%` },
                            ]}
                        />
                    </View>
                )}
            </View>

            {active ? (
                <CustomSwitch value onChange={() => onDeselect()} disabled={disabled} />
            ) : (
                <View style={styles.modelActions}>
                    {!busy && (
                        <PressableScale onPress={onSelect} enabled={!disabled} style={styles.modelButton}>
                            <Text style={[styles.modelButtonText, { color: vars.accentColor }]}>
                                {downloaded ? "Use" : "Get"}
                            </Text>
                        </PressableScale>
                    )}
                    {downloaded && (
                        <PressableScale onPress={onDelete} enabled={!disabled} hitSlop={8} style={styles.modelButton}>
                            <Trash2 size={16} color={vars.secondaryTextColor} />
                        </PressableScale>
                    )}
                </View>
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

    modelTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    tierPill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS_FULL,
    },

    tierText: {
        fontSize: 11,
        fontWeight: "700",
    },

    modelActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },

    modelButton: {
        paddingHorizontal: 8,
        paddingVertical: 6,
    },

    modelButtonText: {
        fontSize: 14,
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
