import { ReactNode } from "react"
import { Text, View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    title: string
    children: ReactNode
}

export default function Section({ title, children }: Props) {
    const { vars } = useThemes()

    return (
        <View style={{ marginBottom: 28 }}>
            <Text
                style={{
                    marginHorizontal: 16,
                    marginBottom: 10,
                    fontSize: 14,
                    fontWeight: "600",
                    color: vars.textColor,
                    opacity: 0.2,
                }}
            >
                {title}
            </Text>

            <View style={{ gap: 12 }}>{children}</View>
        </View>
    )
}
