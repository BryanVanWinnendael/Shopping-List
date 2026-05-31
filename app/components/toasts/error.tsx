import { Text, View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { BlurView } from "expo-blur"
import { XCircle } from "lucide-react-native"

type Props = {
    text1: string
    text2?: string
}

export default function Error({ text1, text2 }: Props) {
    const { theme } = useSettingsStore()
    const { vars } = useThemes()

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
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <XCircle size={16} color="#ef4444" />
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
