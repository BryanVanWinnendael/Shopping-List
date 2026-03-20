import { View, ScrollView, Text } from "react-native"
import { useHeaderHeight } from "@react-navigation/elements"
import { useSettings } from "@/stores/useSettings"
import { getBackgroundColor, getTextColor } from "@/lib/theme"
import FontSize from "@/components/settings/fontSize"
import AColor from "@/components/settings/aColor"
import UserColors from "@/components/settings/userColors"
import MenuIcon from "@/components/settings/menuIcon"
import { ClearStorage } from "@/components/settings/clearStorage"
import Update from "@/components/settings/update"
import Notifications from "@/components/settings/notifications"
import NewUI from "@/components/settings/newUI"
import { TestList } from "@/components/settings/testList"
import { ADMIN_USERS_ARRAY, IS_DEV } from "@/lib/constants"

export default function Settings() {
  const { theme, user } = useSettings()
  const headerHeight = useHeaderHeight()

  const backgroundColor = getBackgroundColor(theme)
  const textColor = getTextColor(theme)

  return (
    <ScrollView
      style={{ backgroundColor, flex: 1 }}
      contentContainerStyle={{ paddingBottom: headerHeight }}
    >
      <View style={{ height: headerHeight + 10 }} />

      <Section title="System" textColor={textColor}>
        <Update />
        <Notifications />
      </Section>

      <Section title="Appearance" textColor={textColor}>
        <NewUI />
        <AColor />
        <MenuIcon />
        <UserColors />
        <FontSize />
      </Section>

      {ADMIN_USERS_ARRAY.includes(user ?? "") && IS_DEV && (
        <Section title="Dev settings" textColor={textColor}>
          <ClearStorage />
          <TestList />
        </Section>
      )}
    </ScrollView>
  )
}

function Section({
  title,
  children,
  textColor,
}: {
  title: string
  children: React.ReactNode
  textColor: string
}) {
  return (
    <View style={{ marginBottom: 28 }}>
      <Text
        style={{
          marginHorizontal: 16,
          marginBottom: 10,
          fontSize: 14,
          fontWeight: "600",
          color: textColor,
          opacity: 0.2,
        }}
      >
        {title}
      </Text>

      <View style={{ gap: 12 }}>{children}</View>
    </View>
  )
}
