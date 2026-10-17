import { memo } from "react"
import { StyleSheet, Text, View } from "react-native"
import { Link } from "expo-router"
import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import { Pin } from "lucide-react-native"
import LiquidGlassView from "@/components/native/liquidGlassView"
import useThemes from "@/hooks/themes/useThemes"
import { useViewLaterStore } from "@/stores/useViewLaterStore"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, FAB_ICON_SIZE } from "@/lib/theme"
import { OnlineRecipe } from "@/types/generated/models/online_recipe"

type Props = {
    recipe: OnlineRecipe
    variant?: "list" | "grid"
}

function Recipe({ recipe, variant = "list" }: Props) {
    const { vars } = useThemes()
    const { recipes: viewLater, toggleViewLater } = useViewLaterStore()

    const isPinned = viewLater.some((item) => item.url === recipe.url)

    return (
        <Link
            href={{
                pathname: "/online-recipes/details",
                params: { url: recipe.url },
            }}
            style={styles.link}
        >
            <Link.Trigger>
                <View style={styles.card}>
                    <Image
                        source={recipe.image}
                        style={[styles.image, variant === "grid" ? styles.gridImage : styles.listImage]}
                        contentFit="cover"
                        transition={250}
                    />

                    {isPinned && (
                        <View pointerEvents="none" style={styles.pin}>
                            <LiquidGlassView style={styles.pinGlass} isInteractive>
                                <Pin size={FAB_ICON_SIZE} strokeWidth={2.2} color={vars.textColor} />
                            </LiquidGlassView>
                        </View>
                    )}

                    <View style={styles.overlay}>
                        <LiquidGlassView style={styles.titleGlass} isInteractive>
                            <Text
                                style={[styles.title, { color: vars.textColor }]}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {recipe.title}
                            </Text>
                        </LiquidGlassView>
                    </View>
                </View>
            </Link.Trigger>

            <Link.Menu>
                <Link.MenuAction
                    title={isPinned ? "Remove from view later" : "View later"}
                    icon={isPinned ? "pin.slash" : "pin"}
                    onPress={async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

                        await toggleViewLater(recipe)
                    }}
                />
            </Link.Menu>

            <Link.Preview style={styles.preview}>
                <Image source={recipe.image} style={styles.previewImage} contentFit="cover" />
            </Link.Preview>
        </Link>
    )
}

export default memo(Recipe)

const styles = StyleSheet.create({
    link: {
        marginBottom: 16,
    },
    card: {
        width: "100%",
        borderRadius: BORDER_RADIUS_L,
        overflow: "hidden",
        elevation: 4,
    },
    image: {
        width: "100%",
    },
    listImage: {
        height: 170,
    },
    gridImage: {
        height: 140,
    },
    pin: {
        position: "absolute",
        top: 12,
        right: 12,
    },
    pinGlass: {
        width: FAB_ICON_SIZE + 20,
        height: FAB_ICON_SIZE + 20,
        borderRadius: BORDER_RADIUS_FULL,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    overlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 14,
    },
    titleGlass: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: BORDER_RADIUS_FULL,
        marginBottom: 6,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 0.2,
    },
    preview: {
        width: 300,
        height: 220,
    },
    previewImage: {
        width: "100%",
        height: "100%",
    },
})
