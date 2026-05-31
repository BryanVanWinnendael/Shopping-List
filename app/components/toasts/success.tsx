import { ActivityIndicator, Text, View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { BlurView } from "expo-blur"
import { CheckCircle2 } from "lucide-react-native"

type Props = {
    text1: string
    text2?: string
}

export default function Success({ text1, text2 }: Props) {
    const { theme } = useSettingsStore()
    const { vars } = useThemes()

    const isLoading = text1 && text1.includes("...")

    return (
        <BlurView
            intensity={70}
            tint={theme === "light" ? "light" : "dark"}
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,

                paddingVertical: 10,
                paddingHorizontal: 14,

                borderRadius: 999,
                overflow: "hidden",

                backgroundColor: vars.backgroundColor,
                borderWidth: 1,
                borderColor: vars.borderColor,

                alignSelf: "center",
            }}
        >
            <View
                style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    backgroundColor: isLoading ? `${vars.accentColor}20` : "rgba(34, 197, 94, 0.15)",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color={vars.accentColor} />
                ) : (
                    <CheckCircle2 size={16} color="#22c55e" />
                )}
            </View>

            <View style={{ flexShrink: 1 }}>
                <Text
                    style={{
                        color: vars.textColor,
                        fontWeight: "600",
                        fontSize: 14,
                    }}
                    numberOfLines={1}
                >
                    {text1}
                </Text>

                {!!text2 && (
                    <Text
                        style={{
                            color: vars.textColor,
                            fontSize: 12,
                            marginTop: 2,
                        }}
                        numberOfLines={2}
                    >
                        {text2}
                    </Text>
                )}
            </View>
        </BlurView>
    )
}
