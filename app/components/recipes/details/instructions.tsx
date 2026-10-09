import useThemes from "@/hooks/themes/useThemes"
import { StyleSheet, Text, View } from "react-native"
import { PressableScale } from "pressto"
import { Expand } from "lucide-react-native"
import { Recipe } from "@/types/generated/models/recipe"

type Props = {
    recipe: Recipe
    open: () => void
}

export default function Instructions({ recipe, open }: Props) {
    const { vars } = useThemes()

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: vars.textColor }]}>Instructions</Text>

                <PressableScale onPress={open}>
                    <Expand size={20} color={vars.textColor} />
                </PressableScale>
            </View>

            {recipe.instructions?.map((instruction, index) => (
                <View key={index} style={styles.row}>
                    <Text style={[styles.index, { color: vars.accentColor }]}>{index + 1}.</Text>

                    <Text style={[styles.text, { color: vars.textColor }]}>{instruction}</Text>
                </View>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
    },
    row: {
        flexDirection: "row",
        marginBottom: 16,
    },
    index: {
        fontWeight: "700",
        marginRight: 12,
        minWidth: 24,
        fontSize: 16,
    },
    text: {
        flex: 1,
        lineHeight: 22,
        fontSize: 16,
    },
})
