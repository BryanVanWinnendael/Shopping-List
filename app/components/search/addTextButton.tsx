import { View, StyleSheet, Text } from "react-native"
import type { ItemType, ProductSearch, Recipe } from "@/types"
import { useSettings } from "@/stores/useSettings"
import { useRecipes } from "@/stores/useRecipes"
import { getBackgroundColor, getBorderColor } from "@/lib/theme"
import uuid from "react-native-uuid"
import { addItem } from "@/lib/firebase"
import { editRecipe } from "@/lib/recipes"
import ContextMenu from "react-native-context-menu-view"

type Props = {
  item: ProductSearch
}

export default function AddTextButton({ item }: Props) {
  const { theme, user } = useSettings()
  const { userRecipes } = useRecipes()

  const backgroundColor = getBackgroundColor(theme)
  const borderColor = getBorderColor(theme)

  const actions = [
    {
      title: "Add to List",
      systemIcon: "plus",
    },
    {
      title: "Add to Recipes",
      systemIcon: "book",
      actions: userRecipes.map((recipe) => ({
        title: recipe.title,
      })),
    },
  ]

  const addToList = async () => {
    if (!user) return

    let trimmed = `${item.brand}: ${item.item.trim()}`
    if (trimmed.endsWith(".")) trimmed = trimmed.slice(0, -1)

    const newItem: ItemType = {
      id: uuid.v4(),
      item: trimmed,
      type: "text",
      addedBy: user,
      addedAt: Date.now(),
      category: item.category,
    }

    try {
      await addItem(newItem)
    } catch (err) {
      console.error("Failed to add item:", err)
    }
  }

  const addToRecipe = async (recipe: Recipe) => {
    if (!user) return

    const toAdd = {
      item: item.item,
      type: "text" as const,
      url: "",
    }

    const updatedRecipe: Recipe = {
      ...recipe,
      list: [...(recipe.list ?? []), toAdd],
    }

    await editRecipe(updatedRecipe)
  }

  const handlePress = (e: any) => {
    const { index, name } = e.nativeEvent

    if (index === 0) {
      addToList()
      return
    }

    if (index === 1) {
      const recipe = userRecipes.find((r) => r.title === name)
      if (recipe) addToRecipe(recipe)
    }
  }

  return (
    <View style={styles.container}>
      <ContextMenu actions={actions} onPress={handlePress}>
        <View style={[styles.button, { borderColor, backgroundColor }]}>
          <Text>Add text</Text>
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
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
})
