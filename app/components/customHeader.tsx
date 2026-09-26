import { View } from "react-native"
import { BlurView } from "expo-blur"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_S } from "@/lib/theme"

export default function CustomHeader() {
    const { theme } = useThemes()

    return (
        <View
            style={{
                flex: 1,
                borderRadius: BORDER_RADIUS_S,
                overflow: "hidden",
            }}
        >
            <BlurView
                intensity={10}
                tint={theme === "light" ? "light" : "dark"}
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    left: 0,
                    height: 40,
                }}
            ></BlurView>
        </View>
    )
}
