import { StyleSheet, View } from "react-native"
import BackButton from "@/components/recipes/details/backButton"
import AddToRecipesButton from "@/components/online-recipes/details/addToRecipesButton"
import { OnlineRecipeDetails } from "@/types/generated/models/online_recipe_details"

type Props = {
    recipe: OnlineRecipeDetails | null
}

export default function Buttons({ recipe }: Props) {
    return (
        <View style={styles.topBar}>
            <BackButton />

            {recipe && <AddToRecipesButton recipe={recipe} />}
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
})
