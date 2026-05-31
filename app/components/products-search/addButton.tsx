import { useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { useRecipesStore } from "@/stores/useRecipesStore"
import ContextMenu from "react-native-context-menu-view"
import * as Haptics from "expo-haptics"
import { Recipe, UpdateRecipeRequest } from "@/types/recipes"
import { Product } from "@/types/products-search"
import useThemes from "@/hooks/themes/useThemes"
import { useProductsList } from "@/hooks/products-list/useProductsList"
import { useUpdateRecipe } from "@/hooks/recipes/useUpdateRecipe"
import { Check } from "lucide-react-native"

type Props = {
    product: Product
    mode: "image" | "text"
}

export default function AddButton({ product, mode }: Props) {
    const { vars } = useThemes()
    const { user } = useSettingsStore()
    const { userRecipes } = useRecipesStore()
    const { actions: updateRecipeActions } = useUpdateRecipe()
    const { actions: productsListActions } = useProductsList()

    const [addedToList, setAddedToList] = useState(false)

    const actions = [
        {
            title: "Add to List",
            systemIcon: "plus",
        },
        {
            title: "Add to Recipes",
            systemIcon: "book",
            actions:
                userRecipes.length > 0
                    ? userRecipes.map((recipe) => ({
                          title: recipe.title,
                      }))
                    : [
                          {
                              title: "You don't have any recipes",
                              disabled: true,
                          },
                      ],
        },
    ]

    const addToList = async () => {
        if (!user || addedToList) return

        let trimmed = `${product.brand}: ${product.name.trim()}`
        if (trimmed.endsWith(".")) trimmed = trimmed.slice(0, -1)

        await productsListActions.createProduct(trimmed, product.image, null, product.category)

        setAddedToList(true)
    }

    const addToRecipe = async (recipe: Recipe) => {
        if (!user) return

        const toAdd =
            mode === "image"
                ? {
                      item: "",
                      type: "image" as const,
                      url: product.image,
                  }
                : {
                      item: product.name,
                      type: "text" as const,
                      url: "",
                  }

        const updatedRecipe: UpdateRecipeRequest = {
            ...recipe,
            ingredients: [...(recipe.ingredients ?? []), toAdd],
        }

        await updateRecipeActions.updateRecipe(updatedRecipe, [])
    }

    const handlePress = async (e: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)

        const { name } = e.nativeEvent

        if (name === "Add to List") {
            await addToList()
            return
        }

        const recipe = userRecipes.find((r) => r.title === name)
        if (recipe) {
            await addToRecipe(recipe)
        }
    }

    const isAdded = addedToList

    return (
        <View style={styles.container}>
            <ContextMenu dropdownMenuMode actions={actions} onPress={handlePress}>
                <View
                    style={[
                        styles.button,
                        {
                            borderColor: isAdded ? "rgba(52,199,89,0.4)" : vars.borderColor,
                            backgroundColor: isAdded ? "rgba(52,199,89,0.15)" : vars.backgroundColor,
                        },
                    ]}
                >
                    {isAdded && <Check size={14} color="#34C759" style={{ marginRight: 6 }} />}

                    <Text
                        style={{
                            color: isAdded ? "#34C759" : vars.textColor,
                            fontWeight: "600",
                        }}
                    >
                        {isAdded ? "Added" : mode === "image" ? "Add image" : "Add text"}
                    </Text>
                </View>
            </ContextMenu>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    button: {
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 999,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
})
