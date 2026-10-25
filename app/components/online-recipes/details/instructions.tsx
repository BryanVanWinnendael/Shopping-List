import { StyleSheet, Text, View } from "react-native"
import { PressableScale } from "pressto"
import { Expand } from "lucide-react-native"
import useThemes from "@/hooks/themes/useThemes"
import { OnlineRecipeDetails } from "@/types/generated/models/online_recipe_details"

type Props = {
    recipe: OnlineRecipeDetails
    open: () => void
}

export default function Instructions({ recipe, open }: Props) {
    const { vars } = useThemes()

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: vars.textColor }]}>Instructions</Text>

                <PressableScale onPress={open} accessibilityRole="button" accessibilityLabel="Expand instructions">
                    <Expand size={20} color={vars.textColor} />
                </PressableScale>
            </View>

            {recipe.instructions?.map((instruction, index) => (
                <View key={`${index}-${instruction}`} style={styles.step}>
                    <Text style={[styles.stepNumber, { color: vars.accentColor }]}>{index + 1}.</Text>
                    <Text style={[styles.stepText, { color: vars.textColor }]}>{instruction}</Text>
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
    step: {
        flexDirection: "row",
        marginBottom: 16,
    },
    stepNumber: {
        minWidth: 24,
        marginRight: 12,
        fontSize: 16,
        fontWeight: "700",
    },
    stepText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 22,
    },
})
