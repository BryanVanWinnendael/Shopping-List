import { Text, View } from "react-native"
import { ReactNode } from "react"
import useThemes from "@/hooks/themes/useThemes"

export type Props = {
    label: string
    children: ReactNode
}

export default function Field({ label, children }: Props) {
    const { vars } = useThemes()

    return (
        <View style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: "600", marginBottom: 8, color: vars.textColor }}>{label}</Text>
            {children}
        </View>
    )
}
