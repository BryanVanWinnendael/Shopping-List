import { StyleSheet, Text, View } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { PressableScale } from "pressto"
import useThemes from "@/hooks/themes/useThemes"

export default function ClearStorage() {
    const { vars } = useThemes()

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

                <PressableScale
                    style={[styles.button, { borderColor: vars.borderColor, backgroundColor: vars.backgroundColor }]}
                    onPress={handleClearStorage}
                >
                    <Text style={[styles.buttonText, { color: vars.textColor }]}>Clear</Text>
                </PressableScale>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        paddingHorizontal: 16,
        marginHorizontal: 8,
        paddingBottom: 16,
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
    button: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 24,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    buttonText: {
        fontSize: 15,
    },
})
