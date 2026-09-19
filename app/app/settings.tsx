import { ScrollView, View } from "react-native"
import { useSettingsStore } from "@/stores/useSettingsStore"
import FontSize from "@/components/settings/fontSize"
import AColor from "@/components/settings/aColor"
import UserColors from "@/components/settings/userColors"
import ClearStorage from "@/components/settings/clearStorage"
import Update from "@/components/settings/update"
import Notifications from "@/components/settings/notifications/notifications"
import TestList from "@/components/settings/testList"
import { ADMIN_USERS_ARRAY, HEADER_HEIGHT } from "@/lib/constants"
import Section from "@/components/settings/section"
import useThemes from "@/hooks/themes/useThemes"

export default function Settings() {
    const { vars } = useThemes()
    const { user } = useSettingsStore()

    return (
        <ScrollView
            style={{ backgroundColor: vars.backgroundColor, flex: 1 }}
            contentContainerStyle={{ paddingBottom: HEADER_HEIGHT }}
        >
            <View style={{ height: HEADER_HEIGHT + 10 }} />

            <Section title="System">
                <Update />
                <Notifications />
            </Section>

            <Section title="Appearance">
                <AColor />
                <UserColors />
                <FontSize />
            </Section>

            {ADMIN_USERS_ARRAY.includes(user ?? "") && (
                <Section title="Admin settings">
                    <ClearStorage />
                </Section>
            )}

            {ADMIN_USERS_ARRAY.includes(user ?? "") && __DEV__ && (
                <Section title="Dev settings">
                    <TestList />
                </Section>
            )}
        </ScrollView>
    )
}
