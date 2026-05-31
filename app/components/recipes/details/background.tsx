import { StyleSheet, View } from "react-native"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { Recipe } from "@/types/recipes"
import { ReactNode } from "react"
import BackButton from "@/components/recipes/details/backButton"
import FavoriteButton from "@/components/recipes/details/favoriteButton"
import BottomSheetButton from "@/components/recipes/update/bottomSheetButton"
import useThemes from "@/hooks/themes/useThemes"
import CustomImage from "@/components/customImage"

type Props = {
    recipe: Recipe
    children?: ReactNode
    open: () => void
}

export default function Background({ recipe, children, open }: Props) {
    const { vars } = useThemes()
    const { user } = useSettingsStore()

    const canEdit = recipe?.user === user

    return (
        <View style={styles.container}>
            <View
                style={[StyleSheet.absoluteFill, { backgroundColor: vars.secondaryBackgroundColor }]}
                pointerEvents="none"
            />

            {recipe.banner && (
                <View style={StyleSheet.absoluteFill}>
                    <CustomImage url={recipe.banner} style={StyleSheet.absoluteFill} />
                </View>
            )}

            <View style={styles.backButtonContainer}>
                <BackButton />
            </View>

            {recipe.title && (
                <View style={[styles.favoriteButtonContainer, { right: canEdit ? 70 : 16 }]}>
                    <FavoriteButton recipe={recipe} />
                </View>
            )}

            {canEdit && (
                <View style={styles.favoriteButtonContainer}>
                    <BottomSheetButton open={open} />
                </View>
            )}

            {children && <View style={styles.floatingContent}>{children}</View>}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        overflow: "hidden",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: 160,
    },
    backButtonContainer: {
        position: "absolute",
        left: 10,
        top: 15,
        zIndex: 10,
    },
    favoriteButtonContainer: {
        position: "absolute",
        top: 15,
        zIndex: 10,
        right: 16,
    },
    floatingContent: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: -40,
        zIndex: 10,
    },
})
