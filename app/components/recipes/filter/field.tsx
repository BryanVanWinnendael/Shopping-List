import { StyleSheet, Text, View } from "react-native"
import { ReactNode } from "react"
import useThemes from "@/hooks/themes/useThemes"

export type Props = {
    label: string
    children: ReactNode
}

export default function Field({ label, children }: Props) {
    const { vars } = useThemes()

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: vars.textColor }]}>{label}</Text>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    label: {
        fontWeight: "600",
        marginBottom: 8,
    },
})
