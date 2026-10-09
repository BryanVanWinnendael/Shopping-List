import { PressableScale } from "pressto"
import { Modal, StyleSheet, Text, View } from "react-native"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { USERS_ARRAY } from "@/lib/constants"
import { BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

export default function SelectUser() {
    const { user, setUser } = useSettingsStore()

    return (
        <Modal visible={user === "None"} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>Select a User</Text>
                    {USERS_ARRAY.map((u) => (
                        <PressableScale key={u} onPress={() => setUser(u)} style={styles.option}>
                            <Text style={styles.optionText}>{u}</Text>
                        </PressableScale>
                    ))}
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
        paddingHorizontal: 16,
    },
    card: {
        backgroundColor: "white",
        padding: 24,
        width: "100%",
        maxWidth: 400,
        borderRadius: BORDER_RADIUS_M,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
        color: "#111827",
    },
    option: {
        backgroundColor: "#f3f4f6",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: BORDER_RADIUS_L,
        marginBottom: 8,
        alignItems: "center",
    },
    optionText: {
        color: "#1f2937",
    },
})
