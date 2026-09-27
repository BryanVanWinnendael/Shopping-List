import { Text, View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"
import { BlurView } from "expo-blur"
import { XCircle } from "lucide-react-native"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

type Props = {
    text1: string
    text2?: string
}

export default function Error({ text1, text2 }: Props) {
    const { vars, appearance } = useThemes()

    return (
        <BlurView
            intensity={70}
            tint={appearance}
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,

                paddingVertical: 10,
                paddingHorizontal: 14,

                borderRadius: BORDER_RADIUS_FULL,
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
                    borderRadius: BORDER_RADIUS_FULL,
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
