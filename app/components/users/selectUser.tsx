import { PressableScale } from "pressto"
import { Modal, View, Text } from "react-native"
import { useSettings } from "@/stores/useSettings"
import { USERS_ARRAY } from "@/lib/constants"

export function SelectUser() {
  const { user, setUser } = useSettings()

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
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            width: "100%",
            maxWidth: 400,
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
                borderRadius: 8,
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
