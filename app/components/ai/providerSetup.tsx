import useThemes from "@/hooks/themes/useThemes"
import { useEffect, useState } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import ProviderOption from "@/components/ai/providerOption"
import { AIProvider } from "@/types/ai"
import { supportsOnDeviceAI } from "@/lib/ai/settings"

type Props = {
    onSelectProvider: (provider: AIProvider) => Promise<void>
    onDownloadModel: () => Promise<void>
    downloadingModel: boolean
}

const OPTIONS: {
    id: AIProvider
    title: string
    description: string
    badge: string
}[] = [
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
        description: "Run an AI model locally. Requires about 0.5 GB of storage.",
        badge: "Offline",
    },
    {
        id: "disabled",
        title: "Disabled",
        description: "Disable the AI assistant and the shake gesture.",
        badge: "Off",
    },
]

export default function ProviderSetup({ onSelectProvider, onDownloadModel, downloadingModel }: Props) {
    const { vars } = useThemes()

    const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null)

    const [supportsBuiltInAI, setSupportsBuiltInAI] = useState(false)
    const [checkingSupport, setCheckingSupport] = useState(true)

    useEffect(() => {
        let mounted = true

        const checkSupport = async () => {
            try {
                const supported = await supportsOnDeviceAI()

                if (mounted) {
                    setSupportsBuiltInAI(supported)
                }
            } catch (error) {
                console.error("Failed to check built-in AI support:", error)

                if (mounted) {
                    setSupportsBuiltInAI(false)
                }
            } finally {
                if (mounted) {
                    setCheckingSupport(false)
                }
            }
        }

        checkSupport()

        return () => {
            mounted = false
        }
    }, [])

    const handleSelect = async (provider: AIProvider) => {
        if (downloadingModel) {
            return
        }

        if (provider === "built-in" && (checkingSupport || !supportsBuiltInAI)) {
            return
        }

        setSelectedProvider(provider)

        try {
            if (provider === "downloaded") {
                await onDownloadModel()
                return
            }

            await onSelectProvider(provider)
        } catch (error) {
            console.error("Failed to select AI provider:", error)

            // Allow the user to try again if selection failed.
            setSelectedProvider(null)
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text
                    style={[
                        styles.title,
                        {
                            color: vars.textColor,
                        },
                    ]}
                >
                    Set up AI
                </Text>

                <Text
                    style={[
                        styles.description,
                        {
                            color: vars.textColor,
                        },
                    ]}
                >
                    Choose how you want the AI assistant to run.
                </Text>
            </View>

            <View style={styles.options}>
                {OPTIONS.map((option) => {
                    const isBuiltInOption = option.id === "built-in"

                    const isDownloadedOption = option.id === "downloaded"

                    const isDownloading = isDownloadedOption && downloadingModel

                    const builtInUnavailable = isBuiltInOption && !checkingSupport && !supportsBuiltInAI

                    const disabled = downloadingModel || (isBuiltInOption && (checkingSupport || !supportsBuiltInAI))

                    let description = option.description

                    if (builtInUnavailable) {
                        description = "Built-in AI is not supported on this device."
                    } else if (isBuiltInOption && checkingSupport) {
                        description = "Checking device support..."
                    }

                    return (
                        <ProviderOption
                            key={option.id}
                            id={option.id}
                            title={option.title}
                            description={description}
                            badge={option.badge}
                            selected={selectedProvider === option.id}
                            disabled={disabled}
                            onPress={() => handleSelect(option.id)}
                        >
                            {isDownloading ? <ActivityIndicator size="small" /> : null}
                        </ProviderOption>
                    )
                })}
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

    options: {
        gap: 12,
    },
})
