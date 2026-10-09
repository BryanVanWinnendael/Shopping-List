import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native"
import { RefObject } from "react"
import { BlurView } from "expo-blur"
import { PressableScale } from "pressto"
import { Trash } from "lucide-react-native"

import EditRecipeForm from "@/components/recipes/update/form"
import useThemes from "@/hooks/themes/useThemes"
import AppBottomSheet, { BottomSheetRef } from "@/components/native/bottom-sheet/appBottomSheet"
import { Recipe } from "@/types/generated/models/recipe"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

type Props = {
    recipe: Recipe
    bottomSheetRef: RefObject<BottomSheetRef | null>
    close: () => void
    deleteRecipe: () => void
    updateRecipeDetails: (recipe: Recipe) => void
    deleteLoading: boolean
}

export default function BottomSheet({
    recipe,
    bottomSheetRef,
    close,
    deleteRecipe,
    updateRecipeDetails,
    deleteLoading,
}: Props) {
    const { vars, appearance } = useThemes()

    const confirmDelete = () => {
        Alert.alert("Delete recipe?", "This action cannot be undone.", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Delete",
                style: "destructive",
                onPress: deleteRecipe,
            },
        ])
    }

    return (
        <AppBottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={["55%", "75%", "100%"]}
            enablePanDownToClose
            onClose={close}
            backgroundMode="adaptive"
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <BlurView intensity={10} tint={appearance} style={styles.blur}>
                        <Text style={[styles.title, { color: vars.textColor }]}>Edit recipe</Text>

                        <PressableScale enabled={!deleteLoading} onPress={confirmDelete} style={styles.deleteButton}>
                            <LiquidGlassView style={styles.deleteGlass} isInteractive>
                                {deleteLoading ? (
                                    <ActivityIndicator size="small" color="#FF453A" />
                                ) : (
                                    <Trash size={17} strokeWidth={2.2} color="#FF453A" />
                                )}
                            </LiquidGlassView>
                        </PressableScale>
                    </BlurView>
                </View>

                <EditRecipeForm recipe={recipe} close={close} updateRecipeDetails={updateRecipeDetails} />
            </View>
        </AppBottomSheet>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        position: "absolute",
        top: -40,
        left: 0,
        right: 0,
        height: 88,
        zIndex: 10,
        overflow: "hidden",
    },
    blur: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 10,
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
    },
    deleteButton: {
        width: 44,
        height: 44,
        marginTop: -10,
    },
    deleteGlass: {
        width: 44,
        height: 44,
        borderRadius: BORDER_RADIUS_FULL,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
})
