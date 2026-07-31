import { StyleSheet, View } from "react-native"
import BackButton from "@/components/recipes/details/backButton"
import { OnlineRecipeDetails } from "@/types/generated/models/online_recipe_details"
import AddToRecipesButton from "@/components/online-recipes/details/addToRecipesButton"

type Props = {
    recipe: OnlineRecipeDetails | null
}

export default function Buttons({ recipe }: Props) {
    return (
        <View style={styles.topBar}>
            <BackButton />

            {recipe && (
                <View style={styles.actions}>
                    <AddToRecipesButton recipe={recipe} />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    topBar: {
        position: "absolute",
        top: 60,
        left: 12,
        right: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 10,
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
})
