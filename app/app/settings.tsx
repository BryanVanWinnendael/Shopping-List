import { ScrollView, View } from "react-native"
import { useHeaderHeight } from "@react-navigation/elements"
import { useSettingsStore } from "@/stores/useSettingsStore"
import FontSize from "@/components/settings/fontSize"
import AColor from "@/components/settings/aColor"
import UserColors from "@/components/settings/userColors"
import ClearStorage from "@/components/settings/clearStorage"
import Update from "@/components/settings/update"
import Notifications from "@/components/settings/notifications/notifications"
import NewUI from "@/components/settings/newUI"
import TestList from "@/components/settings/testList"
import { ADMIN_USERS_ARRAY, IS_DEV } from "@/lib/constants"
import Section from "@/components/settings/section"
import useThemes from "@/hooks/themes/useThemes"

export default function Settings() {
    const { vars } = useThemes()
    const { user } = useSettingsStore()
    const headerHeight = useHeaderHeight()

    return (
        <ScrollView
            style={{ backgroundColor: vars.backgroundColor, flex: 1 }}
            contentContainerStyle={{ paddingBottom: headerHeight }}
        >
            <View style={{ height: headerHeight + 10 }} />

            <Section title="System">
                <Update />
                <Notifications />
            </Section>

            <Section title="Appearance">
                <NewUI />
                <AColor />
                <UserColors />
                <FontSize />
            </Section>

            {ADMIN_USERS_ARRAY.includes(user ?? "") && IS_DEV && (
                <Section title="Dev settings">
                    <ClearStorage />
                    <TestList />
                </Section>
            )}
        </ScrollView>
    )
}
