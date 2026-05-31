import { StyleSheet, View } from "react-native"
import { OnlineRecipe } from "@/types/recipes"
import { ReactNode } from "react"
import BackButton from "@/components/recipes/details/backButton"
import useThemes from "@/hooks/themes/useThemes"
import CustomImage from "@/components/customImage"
import AddToRecipesButton from "@/components/online-recipes/details/addToRecipesButton"

type Props = {
    recipe: OnlineRecipe | null
    children?: ReactNode
}

export default function Background({ recipe, children }: Props) {
    const { vars } = useThemes()

    return (
        <View style={styles.container}>
            <View
                style={[StyleSheet.absoluteFill, { backgroundColor: vars.secondaryBackgroundColor }]}
                pointerEvents="none"
            />

            {recipe && (
                <>
                    <View style={styles.addButtonContainer}>
                        <AddToRecipesButton recipe={recipe} />
                    </View>
                    <View style={StyleSheet.absoluteFill}>
                        <CustomImage url={recipe.image} style={StyleSheet.absoluteFill} />
                    </View>
                </>
            )}

            <View style={styles.backButtonContainer}>
                <BackButton />
            </View>

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
    addButtonContainer: {
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
