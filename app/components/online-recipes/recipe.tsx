import { StyleSheet, Text, View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"
import { Link } from "expo-router"
import { Image } from "expo-image"
import { OnlineRecipe } from "@/types/generated/models/online_recipe"
import { GlassView } from "expo-glass-effect"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L } from "@/lib/theme"

type Props = {
    recipe: OnlineRecipe
    variant?: "list" | "grid"
}

export default function Recipe({ recipe, variant }: Props) {
    const { vars, appearance } = useThemes()

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
                            <GlassView
                                colorScheme={appearance}
                                glassEffectStyle="regular"
                                isInteractive
                                style={styles.titleGlass}
                            >
                                <Text
                                    style={[
                                        styles.recipeTitle,
                                        {
                                            color: vars.textColor,
                                        },
                                    ]}
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                >
                                    {recipe.title}
                                </Text>
                            </GlassView>
                        </View>
                    </View>
                </View>
            </Link.Trigger>

            <Link.Preview style={{ width: 300, height: 220 }}>
                <View style={styles.recipeCard}>
                    <Image source={{ uri: recipe.image }} style={styles.recipeImage} contentFit="cover" />
                </View>
            </Link.Preview>
        </Link>
    )
}

const styles = StyleSheet.create({
    recipeCard: {
        width: "100%",
        borderRadius: BORDER_RADIUS_L,
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
        borderRadius: BORDER_RADIUS_FULL,
        marginBottom: 6,
    },
})
