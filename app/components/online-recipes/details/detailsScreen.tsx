import { StyleSheet, View } from "react-native"
import { useSharedValue } from "react-native-reanimated"
import Background from "@/components/online-recipes/details/background"
import Buttons from "@/components/online-recipes/details/buttons"
import RecipeContent from "@/components/online-recipes/details/content"
import useThemes from "@/hooks/themes/useThemes"
import Skeleton from "@/components/native/skeleton"
import { BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"
import { OnlineRecipeDetails } from "@/types/generated/models/online_recipe_details"

type Props = {
    recipe: OnlineRecipeDetails | null
    open: () => void
}

export default function DetailsScreen({ recipe, open }: Props) {
    const { vars } = useThemes()

    const scrollY = useSharedValue(0)

    return (
        <View style={[styles.container, { backgroundColor: vars.backgroundColor }]}>
            {recipe ? (
                <>
                    <Background recipe={recipe} scrollY={scrollY} />
                    <RecipeContent recipe={recipe} open={open} scrollY={scrollY} />
                </>
            ) : (
                <DetailsSkeleton />
            )}

            <Buttons recipe={recipe} />
        </View>
    )
}

function DetailsSkeleton() {
    return (
        <View style={styles.content}>
            <Skeleton style={styles.skeletonBanner} />

            <View style={styles.skeletonBody}>
                <Skeleton delay={60} style={styles.skeletonTitle} />

                <View style={styles.skeletonMetaRow}>
                    <Skeleton delay={120} style={styles.skeletonMeta} />
                    <Skeleton delay={180} style={styles.skeletonMeta} />
                </View>

                <Skeleton delay={240} style={styles.skeletonLine} />
                <Skeleton delay={300} style={styles.skeletonLineShort} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    skeletonBanner: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 240,
    },
    skeletonBody: {
        paddingTop: 240,
        paddingHorizontal: 20,
        paddingBottom: 80,
    },
    skeletonTitle: {
        height: 36,
        width: "70%",
        borderRadius: BORDER_RADIUS_M,
        marginTop: 8,
        marginBottom: 14,
    },
    skeletonMetaRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 14,
    },
    skeletonMeta: {
        height: 28,
        width: 90,
        borderRadius: BORDER_RADIUS_L,
    },
    skeletonLine: {
        height: 16,
        width: "100%",
        borderRadius: BORDER_RADIUS_M,
        marginBottom: 10,
    },
    skeletonLineShort: {
        height: 16,
        width: "60%",
        borderRadius: BORDER_RADIUS_M,
    },
})
