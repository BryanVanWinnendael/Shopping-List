import { StyleSheet, View } from "react-native"
import { useSettingsStore } from "@/stores/useSettingsStore"
import BackButton from "@/components/recipes/details/backButton"
import FavoriteButton from "@/components/recipes/details/favoriteButton"
import BottomSheetButton from "@/components/recipes/update/bottomSheetButton"
import { Recipe } from "@/types/generated/models/recipe"

type Props = {
    recipe: Recipe
    open: () => void
}

export default function Buttons({ recipe, open }: Props) {
    const { user } = useSettingsStore()

    const canEdit = recipe.user === user

    return (
        <View style={styles.topBar}>
            <BackButton />

            <View style={styles.actions}>
                {recipe.title && <FavoriteButton recipe={recipe} />}

                {canEdit && <BottomSheetButton open={open} />}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    topBar: {
        position: "absolute",
        top: 55,
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
