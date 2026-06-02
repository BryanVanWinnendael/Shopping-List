import {StyleSheet, Text, View} from "react-native"
import {OnlineRecipe} from "@/types/recipes"
import useThemes from "@/hooks/themes/useThemes"
import {Link} from "expo-router"
import GlassOrBlurView from "@/components/glassOrBlurView"
import {Image} from "expo-image"

type Props = {
    recipe: OnlineRecipe
    variant?: "list" | "grid"
}

export default function Recipe({ recipe, variant }: Props) {
    const { vars } = useThemes()

    return (
        <Link
            href={{
                pathname: "/online-recipes/details",
                params: {
                    url: recipe.url,
                },
            }}
            key={recipe.title}
            style={{ marginBottom: 16 }}
        >
            <Link.Trigger>
                <View style={styles.recipeCard}>
                    <View style={styles.imageWrapper}>
                        <Image
                            source={recipe.image}
                            style={[styles.recipeImage, { height: variant === "grid" ? 140 : 170 }]}
                            contentFit={"cover"}
                            transition={250}
                        />

                        <View style={styles.overlay}>
                            <GlassOrBlurView
                                backgroundColor={vars.secondaryBackgroundColor}
                                blurBorderWidth={0}
                                style={styles.titleGlass}
                                forceBlur
                            >
                                <Text style={[styles.recipeTitle, { color: vars.textColor }]} numberOfLines={2}>
                                    {recipe.title}
                                </Text>
                            </GlassOrBlurView>
                        </View>
                    </View>
                </View>
            </Link.Trigger>

            <Link.Preview style={{ width: 300, height: 220 }}>
                <View style={styles.recipeCard}>
                    <Image source={{ uri: recipe.image }} style={styles.recipeImage} resizeMode="cover" />
                </View>
            </Link.Preview>
        </Link>
    )
}

const styles = StyleSheet.create({
    recipeCard: {
        width: "100%",
        borderRadius: 28,
        overflow: "hidden",
        elevation: 4,
        backgroundColor: "transparent",
    },
    imageWrapper: {
        position: "relative",
    },
    recipeImage: {
        width: "100%",
        height: 170,
    },
    overlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 14,
        gap: 8,
    },
    recipeTitle: {
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 0.2,
    },
    titleGlass: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        marginBottom: 6,
    },
})
