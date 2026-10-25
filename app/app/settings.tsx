import { ScrollView, StyleSheet } from "react-native"
import { useSettingsStore } from "@/stores/useSettingsStore"
import FontSize from "@/components/settings/fontSize"
import AColor from "@/components/settings/aColor"
import UserColors from "@/components/settings/userColors"
import ClearStorage from "@/components/settings/clearStorage"
import Update from "@/components/settings/update"
import Notifications from "@/components/settings/notifications/notifications"
import TestList from "@/components/settings/testList"
import Section from "@/components/settings/section"
import AiModel from "@/components/settings/aiModel"
import useThemes from "@/hooks/themes/useThemes"
import { ADMIN_USERS_ARRAY, HEADER_HEIGHT } from "@/lib/constants"

export default function Settings() {
    const { vars } = useThemes()
    const user = useSettingsStore((state) => state.user)

    const isAdmin = ADMIN_USERS_ARRAY.includes(user ?? "")

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: vars.backgroundColor }]}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            <Section title="System">
                <Update />
                <Notifications />
            </Section>

            <Section title="Appearance">
                <AColor />
                <UserColors />
                <FontSize />
            </Section>

            <Section title="AI">
                <AiModel />
            </Section>

            {isAdmin && (
                <Section title="Admin settings">
                    <ClearStorage />
                </Section>
            )}

            {isAdmin && __DEV__ && (
                <Section title="Dev settings">
                    <TestList />
                </Section>
            )}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingTop: HEADER_HEIGHT + 10,
        paddingBottom: HEADER_HEIGHT,
    },
})
