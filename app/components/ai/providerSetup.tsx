import { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { ChevronLeft } from "lucide-react-native"
import { PressableScale } from "pressto"
import ProviderOption from "@/components/ai/providerOption"
import useThemes from "@/hooks/themes/useThemes"
import {
    LOCAL_MODELS,
    TIER_LABELS,
    formatModelSize,
    getDownloadedModelIds,
    supportsOnDeviceAI,
} from "@/lib/ai/settings"
import { AIProvider } from "@/types/ai"

type Props = {
    onSelectProvider: (provider: AIProvider, modelId?: string) => Promise<void>
}

type Option = {
    id: AIProvider
    title: string
    description: string
    badge: string
}

const OPTIONS: Option[] = [
    {
        id: "cloud",
        title: "Cloud AI",
        description: "Powerful AI running in the cloud. Requires an internet connection.",
        badge: "Powerful",
    },
    {
        id: "built-in",
        title: "Built-in AI",
        description: "Use the AI model available on your device. Your conversations stay on your device.",
        badge: "Private",
    },
    {
        id: "downloaded",
        title: "Download a model",
        description: "Run an AI model offline. Pick a light or a powerful model.",
        badge: "Offline",
    },
    {
        id: "disabled",
        title: "Disabled",
        description: "Disable the AI assistant and the shake gesture.",
        badge: "Off",
    },
]

export default function ProviderSetup({ onSelectProvider }: Props) {
    const { vars } = useThemes()

    const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null)
    const [choosingModel, setChoosingModel] = useState(false)
    const [supportsBuiltInAI, setSupportsBuiltInAI] = useState(false)
    const [checkingSupport, setCheckingSupport] = useState(true)
    const [downloadedIds, setDownloadedIds] = useState<string[]>([])

    useEffect(() => {
        let mounted = true

        const initialize = async () => {
            try {
                const [supported, ids] = await Promise.all([supportsOnDeviceAI(), getDownloadedModelIds()])

                if (!mounted) return

                setSupportsBuiltInAI(supported)
                setDownloadedIds(ids)
            } catch (error) {
                console.error("Failed to check on-device AI setup:", error)

                if (mounted) {
                    setSupportsBuiltInAI(false)
                }
            } finally {
                if (mounted) {
                    setCheckingSupport(false)
                }
            }
        }

        initialize()

        return () => {
            mounted = false
        }
    }, [])

    const builtInUnavailable = checkingSupport || !supportsBuiltInAI

    const getDescription = (option: Option) => {
        if (option.id !== "built-in") return option.description
        if (checkingSupport) return "Checking device support..."
        if (!supportsBuiltInAI) return "Built-in AI is not supported on this device."
        return option.description
    }

    const handleSelect = async (provider: AIProvider) => {
        if (provider === "built-in" && builtInUnavailable) return

        if (provider === "downloaded") {
            setChoosingModel(true)
            return
        }

        setSelectedProvider(provider)

        try {
            await onSelectProvider(provider)
        } catch (error) {
            console.error("Failed to select AI provider:", error)
            setSelectedProvider(null)
        }
    }

    const handleSelectModel = async (modelId: string) => {
        setSelectedProvider("downloaded")

        try {
            await onSelectProvider("downloaded", modelId)
        } catch (error) {
            console.error("Failed to select AI model:", error)
            setSelectedProvider(null)
            setChoosingModel(false)
        }
    }

    if (choosingModel) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <PressableScale
                        onPress={() => setChoosingModel(false)}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel="Back"
                        style={styles.backButton}
                    >
                        <ChevronLeft size={20} color={vars.textColor} />
                    </PressableScale>

                    <Text style={[styles.title, { color: vars.textColor }]}>Choose a model</Text>
                    <Text style={[styles.description, { color: vars.textColor }]}>
                        Light models answer faster. Powerful models reason better and need more storage.
                    </Text>
                </View>

                <View style={styles.options}>
                    {LOCAL_MODELS.map((model) => {
                        const downloaded = downloadedIds.includes(model.id)

                        return (
                            <PressableScale
                                key={model.id}
                                onPress={() => handleSelectModel(model.id)}
                                style={[
                                    styles.model,
                                    {
                                        backgroundColor:
                                            selectedProvider === "downloaded"
                                                ? `${vars.accentColor}12`
                                                : vars.backgroundColor,
                                        borderColor:
                                            selectedProvider === "downloaded"
                                                ? vars.accentColor
                                                : vars.secondaryBorderColor,
                                    },
                                ]}
                            >
                                <View style={styles.modelHeader}>
                                    <Text style={[styles.modelName, { color: vars.textColor }]}>{model.name}</Text>
                                    <View style={[styles.tierPill, { backgroundColor: `${vars.accentColor}1f` }]}>
                                        <Text style={[styles.tierText, { color: vars.accentColor }]}>
                                            {TIER_LABELS[model.tier]}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={[styles.modelDescription, { color: vars.textColor }]}>{model.blurb}</Text>

                                <Text style={[styles.modelMeta, { color: vars.textColor }]}>
                                    {formatModelSize(model.sizeBytes)} • {downloaded ? "Downloaded" : "Needs download"}
                                </Text>
                            </PressableScale>
                        )
                    })}
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: vars.textColor }]}>Set up AI</Text>
                <Text style={[styles.description, { color: vars.textColor }]}>
                    Choose how you want the AI assistant to run.
                </Text>
            </View>

            <View style={styles.options}>
                {OPTIONS.map((option) => (
                    <ProviderOption
                        key={option.id}
                        title={option.title}
                        description={getDescription(option)}
                        badge={option.badge}
                        selected={selectedProvider === option.id}
                        disabled={option.id === "built-in" && builtInUnavailable}
                        onPress={() => handleSelect(option.id)}
                    />
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
    },
    backButton: {
        alignSelf: "flex-start",
        marginBottom: 12,
        padding: 4,
    },
    options: {
        gap: 12,
    },
    model: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        gap: 6,
    },
    modelHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    modelName: {
        fontSize: 16,
        fontWeight: "700",
        flex: 1,
    },
    tierPill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
    },
    tierText: {
        fontSize: 11,
        fontWeight: "700",
    },
    modelDescription: {
        fontSize: 13,
    },
    modelMeta: {
        fontSize: 12,
        opacity: 0.7,
    },
})
