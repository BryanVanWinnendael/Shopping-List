import { Text } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { GRADIENT, VERSION } from "@/lib/constants"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

export default function InfoChip() {
    return (
        <LinearGradient
            pointerEvents="none"
            colors={GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
                position: "absolute",
                top: 12,
                right: 16,
                zIndex: 999,
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: BORDER_RADIUS_FULL,
            }}
        >
            <Text
                style={{
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: "600",
                    letterSpacing: 0.6,
                }}
            >
                {__DEV__ ? "DEV " : ""}V{VERSION}
            </Text>
        </LinearGradient>
    )
}
