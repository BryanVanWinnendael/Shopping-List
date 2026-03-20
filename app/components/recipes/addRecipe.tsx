import { useRef, useCallback } from "react"
import { Text, KeyboardAvoidingView, Platform } from "react-native"
import BottomSheet from "@gorhom/bottom-sheet"
import { useSettings } from "@/stores/useSettings"
import {
  getBlurSecondaryBackgroundColor,
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import { AddRecipeForm } from "./addRecipeForm"
import { Recipe } from "@/types"
import { addRecipe } from "@/lib/recipes"
import { Plus } from "lucide-react-native"
import { CustomBottomSheet } from "../customBottomSheet"
import { PressableScale } from "pressto"
import { GlassOrBlurView } from "../glassOrBlurView"
import { useInteractions } from "@/stores/useInteractions"

type Props = {
  fetchRecipes: () => Promise<void>
}

export function AddRecipe({ fetchRecipes }: Props) {
  const { theme } = useSettings()
  const { setError } = useInteractions()

  const bottomSheetRef = useRef<BottomSheet>(null)

  const textColor = getTextColor(theme)
  const blurSecondaryBackgroundColor = getBlurSecondaryBackgroundColor(theme)
  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const borderColor = getBorderColor(theme)

  const openSheet = useCallback(() => {
    bottomSheetRef.current?.expand()
  }, [])

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close()
  }, [])

  const onSubmit = async (recipe: Recipe) => {
    const success = await addRecipe(recipe)
    if (!success) setError("Failed to create recipe")
    fetchRecipes()
    closeSheet()
  }

  return (
    <>
      <GlassOrBlurView
        style={[
          {
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            bottom: 30,
            right: 24,
            borderRadius: 50,
            padding: 12,
            width: 48,
            height: 48,
          },
        ]}
        glassBackgroundColor={secondaryBackgroundColor}
        givenGlassBorderColor={secondaryBackgroundColor}
        blurBackground={blurSecondaryBackgroundColor}
        givenBlurBorderColor={borderColor}
        blurBorderWidth={1}
      >
        <PressableScale
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={openSheet}
        >
          <Plus size={20} color={textColor} />
        </PressableScale>
      </GlassOrBlurView>

      <CustomBottomSheet sheetRef={bottomSheetRef} onClose={closeSheet}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: textColor,
            marginBottom: 12,
          }}
        >
          Add a new recipe
        </Text>
        <KeyboardAvoidingView
          style={{ flex: 1, height: "100%" }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <AddRecipeForm onSubmit={onSubmit} />
        </KeyboardAvoidingView>
      </CustomBottomSheet>
    </>
  )
}
