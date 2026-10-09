import { Text } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { StyleSheet } from "react-native"
import { GRADIENT, VERSION } from "@/lib/constants"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

export default function InfoChip() {
    return (
        <LinearGradient
            pointerEvents="none"
            colors={GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.chip}
        >
            <Text style={styles.text}>
                {__DEV__ ? "DEV " : ""}V{VERSION}
            </Text>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    chip: {
        position: "absolute",
        top: 12,
        right: 16,
        zIndex: 999,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: BORDER_RADIUS_FULL,
    },
    text: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 0.6,
    },
})
