import { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import ProviderOption from "@/components/ai/providerOption"
import useThemes from "@/hooks/themes/useThemes"
import { supportsOnDeviceAI } from "@/lib/ai/settings"
import { AIProvider } from "@/types/ai"

type Props = {
    onSelectProvider: (provider: AIProvider) => Promise<void>
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
        id: "disabled",
        title: "Disabled",
        description: "Disable the AI assistant and the shake gesture.",
        badge: "Off",
    },
]

export default function ProviderSetup({ onSelectProvider }: Props) {
    const { vars } = useThemes()

    const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null)
    const [supportsBuiltInAI, setSupportsBuiltInAI] = useState(false)
    const [checkingSupport, setCheckingSupport] = useState(true)

    useEffect(() => {
        let mounted = true

        supportsOnDeviceAI()
            .catch((error) => {
                console.error("Failed to check built-in AI support:", error)
                return false
            })
            .then((supported) => {
                if (!mounted) return

                setSupportsBuiltInAI(supported)
                setCheckingSupport(false)
            })

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

        setSelectedProvider(provider)

        try {
            await onSelectProvider(provider)
        } catch (error) {
            console.error("Failed to select AI provider:", error)
            setSelectedProvider(null)
        }
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
    options: {
        gap: 12,
    },
})
