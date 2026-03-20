import { Text } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

export default function DevScreen() {
  return (
    <LinearGradient
      pointerEvents="none"
      colors={["#4E64D4", "#D0ACCA", "#F2B297"]}
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
        IN DEV
      </Text>
    </LinearGradient>
  )
}
