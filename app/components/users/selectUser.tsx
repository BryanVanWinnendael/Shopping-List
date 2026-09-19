import { PressableScale } from "pressto"
import { Modal, Text, View } from "react-native"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { USERS_ARRAY } from "@/lib/constants"
import { BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

export default function SelectUser() {
    const { user, setUser } = useSettingsStore()

    return (
        <Modal visible={user === "None"} transparent animationType="fade">
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    paddingHorizontal: 16,
                }}
            >
                <View
                    style={{
                        backgroundColor: "white",
                        padding: 24,
                        width: "100%",
                        maxWidth: 400,
                        borderRadius: BORDER_RADIUS_M,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            marginBottom: 16,
                            textAlign: "center",
                            color: "#111827",
                        }}
                    >
                        Select a User
                    </Text>
                    {USERS_ARRAY.map((u) => (
                        <PressableScale
                            key={u}
                            onPress={() => setUser(u)}
                            style={{
                                backgroundColor: "#f3f4f6",
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                borderRadius: BORDER_RADIUS_L,
                                marginBottom: 8,
                                alignItems: "center",
                            }}
                        >
                            <Text style={{ color: "#1f2937" }}>{u}</Text>
                        </PressableScale>
                    ))}
                </View>
            </View>
        </Modal>
    )
}
