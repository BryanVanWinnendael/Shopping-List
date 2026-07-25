import { Text } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { GRADIENT, IS_DEV, VERSION } from "@/lib/constants"

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
                borderRadius: 999,
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
                {!IS_DEV ? "DEV " : ""}V{VERSION}
            </Text>
        </LinearGradient>
    )
}
