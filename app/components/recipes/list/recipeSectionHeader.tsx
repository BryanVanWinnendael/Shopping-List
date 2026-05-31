import { StyleSheet, Text } from "react-native"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    title: string
}

export default function RecipeSectionHeader({ title }: Props) {
    const { vars } = useThemes()

    return (
        <Text
            style={[
                styles.title,
                {
                    color: vars.accentColor,
                    backgroundColor: `${vars.accentColor}33`,
                },
            ]}
        >
            {title}
        </Text>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 15,
        fontWeight: "700",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 24,
        marginBottom: 16,
        alignSelf: "flex-start",
    },
})
