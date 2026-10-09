import { StyleSheet, View } from "react-native"
import { BlurView } from "expo-blur"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_S } from "@/lib/theme"

export default function CustomHeader() {
    const { appearance } = useThemes()

    return (
        <View style={styles.container}>
            <BlurView intensity={10} tint={appearance} style={styles.blur}></BlurView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: BORDER_RADIUS_S,
        overflow: "hidden",
    },
    blur: {
        position: "absolute",
        top: 0,
        right: 0,
        left: 0,
        height: 40,
    },
})
