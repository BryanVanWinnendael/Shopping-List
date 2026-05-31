import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Text, View } from "react-native"
import { PressableScale } from "pressto"
import GlassOrBlurView from "@/components/glassOrBlurView"
import { Trash } from "lucide-react-native"
import EditRecipeForm from "@/components/recipes/update/form"
import CustomBottomSheet from "@/components/customBottomSheet"
import { Recipe } from "@/types/recipes"
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { RefObject } from "react"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    recipe: Recipe
    bottomSheetRef: RefObject<BottomSheetMethods | null>
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
    const { vars } = useThemes()

    const confirmDelete = () => {
        Alert.alert("Delete recipe?", "This action cannot be undone.", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    deleteRecipe()
                },
            },
        ])
    }

    return (
        <CustomBottomSheet sheetRef={bottomSheetRef} onClose={close}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text
                    style={{
                        fontSize: 18,
                        fontWeight: "600",
                        color: vars.textColor,
                        marginBottom: 12,
                    }}
                >
                    Edit recipe
                </Text>

                <PressableScale
                    enabled={!deleteLoading}
                    onPress={confirmDelete}
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        width: 40,
                        height: 40,
                    }}
                >
                    <GlassOrBlurView
                        borderColor={`${vars.secondaryBorderColor}70`}
                        style={[
                            {
                                borderRadius: 50,
                                overflow: "hidden",
                                justifyContent: "center",
                                alignItems: "center",
                                marginBottom: 8,
                                width: 40,
                                height: 40,
                            },
                        ]}
                    >
                        {deleteLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Trash size={16} color={vars.textColor} />
                        )}
                    </GlassOrBlurView>
                </PressableScale>
            </View>

            {recipe.id && (
                <KeyboardAvoidingView
                    style={{ flex: 1, height: "100%" }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={0}
                >
                    <EditRecipeForm recipe={recipe} close={close} updateRecipeDetails={updateRecipeDetails} />
                </KeyboardAvoidingView>
            )}
        </CustomBottomSheet>
    )
}
