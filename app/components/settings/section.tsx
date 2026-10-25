import type { ReactNode } from "react"
import { StyleSheet, Text, View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    title: string
    children: ReactNode
}

export default function Section({ title, children }: Props) {
    const { vars } = useThemes()

    return (
        <View style={styles.section}>
            <Text style={[styles.heading, { color: vars.textColor }]}>{title}</Text>

            <View style={styles.children}>{children}</View>
        </View>
    )
}

const styles = StyleSheet.create({
    section: {
        marginBottom: 28,
    },
    heading: {
        marginHorizontal: 16,
        marginBottom: 10,
        fontSize: 14,
        fontWeight: "600",
        opacity: 0.2,
    },
    children: {
        gap: 12,
    },
})
