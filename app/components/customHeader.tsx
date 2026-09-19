import { View } from "react-native"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_S } from "@/lib/theme"

export default function CustomHeader() {
    const { vars, theme } = useThemes()

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
                    bottom: -40,
                }}
            >
                <LinearGradient
                    colors={[
                        `${vars.backgroundColor}CC`,
                        `${vars.backgroundColor}80`,
                        `${vars.backgroundColor}35`,
                        `${vars.backgroundColor}00`,
                    ]}
                    locations={[0, 0.3, 0.65, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{ flex: 1 }}
                />
            </BlurView>
        </View>
    )
}
