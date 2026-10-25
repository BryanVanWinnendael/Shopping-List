import { StyleSheet, Text } from "react-native"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_L } from "@/lib/theme"

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
        borderRadius: BORDER_RADIUS_L,
        marginBottom: 16,
        alignSelf: "flex-start",
    },
})
