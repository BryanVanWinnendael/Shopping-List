import { StyleSheet, Text, View } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { PressableScale } from "pressto"
import { GlassView } from "expo-glass-effect"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L } from "@/lib/theme"

export default function ClearStorage() {
    const { vars, appearance } = useThemes()

    const handleClearStorage = async () => {
        await AsyncStorage.clear()
    }

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: vars.secondaryBackgroundColor,
                    borderColor: vars.secondaryBorderColor,
                    borderWidth: 1,
                },
            ]}
        >
            <View style={styles.row}>
                <Text style={[styles.title, { color: vars.textColor }]}>Clear Storage</Text>

                <GlassView glassEffectStyle="regular" isInteractive colorScheme={appearance} style={styles.buttonGlass}>
                    <PressableScale onPress={handleClearStorage} style={styles.button}>
                        <Text
                            style={[
                                styles.buttonText,
                                {
                                    color: vars.textColor,
                                },
                            ]}
                        >
                            Clear
                        </Text>
                    </PressableScale>
                </GlassView>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BORDER_RADIUS_L,
        paddingHorizontal: 16,
        paddingBottom: 16,
        marginHorizontal: 8,
        overflow: "hidden",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 16,
    },
    title: {
        fontWeight: "600",
        fontSize: 16,
    },
    buttonGlass: {
        minWidth: 64,
        height: 40,
        borderRadius: BORDER_RADIUS_FULL,
        overflow: "hidden",
    },
    button: {
        minWidth: 64,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: "600",
    },
})
