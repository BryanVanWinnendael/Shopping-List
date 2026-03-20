import {
  View,
  Text,
  Switch,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native"
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated"
import { useSettings } from "@/stores/useSettings"
import UserColor from "./userColor"
import {
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import { USERS_ARRAY } from "@/lib/constants"

type Props = {
  expanded: boolean
  children: React.ReactNode
  duration?: number
  style?: StyleProp<ViewStyle>
}

function AccordionItem({ expanded, children, duration = 400, style }: Props) {
  const contentHeight = useSharedValue(0)

  const animatedHeight = useDerivedValue(() =>
    withTiming(expanded ? contentHeight.value : 0, { duration }),
  )

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }))

  return (
    <Animated.View style={[animatedStyle, { overflow: "hidden" }, style]}>
      <View
        style={{ position: "absolute", width: "100%", paddingBottom: 20 }}
        onLayout={(e) => {
          contentHeight.value = e.nativeEvent.layout.height
        }}
      >
        {children}
      </View>
    </Animated.View>
  )
}

export default function UserColors() {
  const { aColor, theme, setUserColors, userColors } = useSettings()

  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const borderColor = getBorderColor(theme)
  const textColor = getTextColor(theme)

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: secondaryBackgroundColor,
          borderColor: borderColor,
          borderWidth: 0.2,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={[styles.headerText, { color: textColor }]}>
            Enable User Colors
          </Text>
          <Text
            style={[
              styles.subText,
              { color: theme === "light" ? "#9ca3af" : "#50555C" },
            ]}
          >
            Enable custom label colors for each user in items
          </Text>
        </View>

        <Switch
          value={userColors.enabled}
          onValueChange={(val) =>
            setUserColors({ ...userColors, enabled: val })
          }
          trackColor={{ false: "#767577", true: aColor }}
          ios_backgroundColor="#767577"
          thumbColor={userColors.enabled ? "#fff" : "#f4f3f4"}
        />
      </View>

      <AccordionItem
        expanded={userColors.enabled}
        style={styles.usersContainer}
      >
        {USERS_ARRAY.map((user, index) => (
          <UserColor user={user} key={index} />
        ))}
      </AccordionItem>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    marginHorizontal: 8,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  headerText: {
    fontWeight: "600",
    fontSize: 16,
  },
  subText: {
    fontSize: 12,
    marginTop: 2,
  },
  usersContainer: {
    marginTop: 16,
  },
})
