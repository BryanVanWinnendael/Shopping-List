import { useState, useEffect, useRef, useCallback } from "react"
import {
  View,
  Text,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Modal,
} from "react-native"
import { useSettings } from "@/stores/useSettings"
import { RecipesBackground } from "@/components/recipes/recipesBackground"
import { IngredientsList } from "@/components/recipes/ingredientsList"
import { Recipe } from "@/types"
import BottomSheet from "@gorhom/bottom-sheet"
import { EditRecipeForm } from "@/components/recipes/edditRecipeForm"
import { deleteRecipe, editRecipe, getRecipe } from "@/lib/recipes"
import { router, useLocalSearchParams } from "expo-router"
import { Pencil, Trash } from "lucide-react-native"
import { deleteRecipeStorage } from "@/lib/storage"
import { useHeaderHeight } from "@react-navigation/elements"
import { getBackgroundColor, getBorderColor, getTextColor } from "@/lib/theme"
import { MEALS } from "@/lib/constants"
import { CustomBottomSheet } from "@/components/customBottomSheet"
import { PressableScale } from "pressto"
import { GlassOrBlurView } from "@/components/glassOrBlurView"
import { useInteractions } from "@/stores/useInteractions"

export default function RecipeDetails() {
  const { theme, aColor, user } = useSettings()
  const { setUpdateRecipes, setError } = useInteractions()
  const { id } = useLocalSearchParams()
  const headerHeight = useHeaderHeight()

  const bottomSheetRef = useRef<BottomSheet>(null)

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false)

  const backgroundColor = getBackgroundColor(theme)
  const borderColor = getBorderColor(theme)
  const textColor = getTextColor(theme)

  const showConfirmDelete = () => setConfirmDeleteVisible(true)
  const hideConfirmDelete = () => setConfirmDeleteVisible(false)

  const handleConfirmDelete = async () => {
    if (!recipe) return
    await handleDeleteRecipe(recipe)
    hideConfirmDelete()
  }

  const openSheet = useCallback(() => {
    bottomSheetRef.current?.expand()
  }, [])

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close()
  }, [])

  const handleEditRecipe = async (recipe: Recipe) => {
    await editRecipe(recipe)
    setRecipe(recipe)
    closeSheet()
    setUpdateRecipes(true)
  }

  const handleDeleteRecipe = async (recipe: Recipe) => {
    const successStorage = await deleteRecipeStorage(recipe.id)
    if (!successStorage) return setError("Failed to delete recipe images")
    const success = await deleteRecipe(recipe.id)
    if (!success) return setError("Failed to delete recipe")

    setUpdateRecipes(true)
    closeSheet()
    router.replace("/recipes")
  }

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id || (typeof id !== "string" && !Array.isArray(id))) return
      const recipeId = Array.isArray(id) ? id[0] : id
      const activeRecipe = await getRecipe(recipeId)
      setRecipe(activeRecipe)
    }
    fetchRecipe()
  }, [id])

  if (!recipe) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: backgroundColor,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: textColor }}>Loading...</Text>
      </View>
    )
  }

  return (
    <>
      <View
        style={{
          flex: 1,
          backgroundColor: backgroundColor,
          paddingTop: headerHeight - 40,
        }}
      >
        <RecipesBackground recipe={recipe} openSheet={openSheet} />

        <View
          style={{
            position: "absolute",
            top: headerHeight + 80,
            left: 10,
            right: 10,
            borderRadius: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 5,
            zIndex: 1,
          }}
        >
          <GlassOrBlurView
            style={{
              borderRadius: 12,
              padding: 16,
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                flex: 1,
                width: "100%",
              }}
            >
              <Text
                style={{
                  color: textColor,
                  fontSize: 26,
                  fontWeight: "bold",
                  flexShrink: 1,
                }}
                numberOfLines={2}
              >
                {recipe.title}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                marginTop: 8,
                gap: 12,
              }}
            >
              {recipe.mealType && recipe.mealType !== "Any" && (
                <View
                  style={{
                    ...styles.chip,
                    backgroundColor: backgroundColor,
                    borderWidth: 1,
                    borderColor: borderColor,
                  }}
                >
                  <Text
                    style={{
                      color: textColor,
                      fontSize: 13,
                      fontWeight: "bold",
                      flexShrink: 1,
                      textTransform: "capitalize",
                    }}
                  >
                    {MEALS[recipe.mealType]} {recipe.mealType}
                  </Text>
                </View>
              )}

              {recipe.country && (
                <View
                  style={{
                    ...styles.chip,
                    backgroundColor: backgroundColor,
                    borderWidth: 1,
                    borderColor: borderColor,
                  }}
                >
                  <Text
                    style={{
                      color: textColor,
                      fontSize: 13,
                      fontWeight: "bold",
                      flexShrink: 1,
                      textTransform: "capitalize",
                    }}
                  >
                    {recipe.country}
                  </Text>
                </View>
              )}

              {Number(recipe.time) > 0 && (
                <View
                  style={{
                    ...styles.chip,
                    backgroundColor: backgroundColor,
                    borderWidth: 1,
                    borderColor: borderColor,
                  }}
                >
                  <Text
                    style={{
                      color: textColor,
                      fontSize: 13,
                      fontWeight: "bold",
                      flexShrink: 1,
                    }}
                  >
                    ⏱ {recipe.time} min
                  </Text>
                </View>
              )}
            </View>
          </GlassOrBlurView>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: 80,
            paddingHorizontal: 16,
          }}
          scrollEventThrottle={16}
        >
          {recipe.source && (
            <PressableScale
              onPress={() => Linking.openURL(recipe.source!)}
              style={{
                backgroundColor: `${aColor}33`,
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  color: aColor,
                  textDecorationLine: "underline",
                }}
              >
                View full recipe ↗
              </Text>
            </PressableScale>
          )}

          {recipe.notes && (
            <View
              style={{
                borderRadius: 12,
                marginBottom: 25,
              }}
            >
              <Text
                style={{
                  color: textColor,
                  fontSize: 20,
                  fontWeight: "bold",
                  marginBottom: 25,
                }}
              >
                Description
              </Text>
              <Text
                style={{
                  color: textColor,
                  fontSize: 15,
                }}
              >
                {recipe.notes}
              </Text>
            </View>
          )}

          {recipe.list && recipe.list?.length > 0 && (
            <IngredientsList recipe={recipe} />
          )}

          <View style={{ height: 50 }} />
        </ScrollView>
      </View>

      <CustomBottomSheet sheetRef={bottomSheetRef} onClose={closeSheet}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: textColor,
              marginBottom: 12,
            }}
          >
            Edit recipe
          </Text>

          <PressableScale
            onPress={showConfirmDelete}
            style={{
              justifyContent: "center",
              alignItems: "center",
              width: 40,
              height: 40,
            }}
          >
            <GlassOrBlurView
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
              <Trash size={16} color={textColor} />
            </GlassOrBlurView>
          </PressableScale>
        </View>

        {recipe && (
          <KeyboardAvoidingView
            style={{ flex: 1, height: "100%" }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={0}
          >
            <EditRecipeForm recipe={recipe} onEdit={handleEditRecipe} />
          </KeyboardAvoidingView>
        )}
      </CustomBottomSheet>

      <Modal
        visible={confirmDeleteVisible}
        transparent
        animationType="fade"
        onRequestClose={hideConfirmDelete}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: backgroundColor }]}
          >
            <Text style={[styles.modalText, { color: textColor }]}>
              Are you sure you want to delete this recipe?
            </Text>
            <View style={styles.modalButtons}>
              <PressableScale
                style={[styles.cancelButton, { borderColor: borderColor }]}
                onPress={hideConfirmDelete}
              >
                <Text style={{ color: textColor }}>Cancel</Text>
              </PressableScale>
              <PressableScale
                style={[styles.deleteButton, { backgroundColor: aColor }]}
                onPress={handleConfirmDelete}
              >
                <Text style={{ color: "#fff" }}>Delete</Text>
              </PressableScale>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 25,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    alignItems: "center",
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
})
