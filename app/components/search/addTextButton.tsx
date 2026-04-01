import { View, StyleSheet, Text } from "react-native"
import type { ItemType, ProductSearch, Recipe } from "@/types"
import { useSettings } from "@/stores/useSettings"
import { getBackgroundColor, getBorderColor } from "@/lib/theme"
import uuid from "react-native-uuid"
import { addItem } from "@/lib/firebase"
import { editRecipe } from "@/lib/recipes"
import * as ContextMenu from "zeego/context-menu"
import { useRecipes } from "@/stores/useRecipes"

type Props = {
  item: ProductSearch
}

export default function AddTextButton({ item }: Props) {
  const { theme, user } = useSettings()
  const { userRecipes } = useRecipes()

  const backgroundColor = getBackgroundColor(theme)
  const borderColor = getBorderColor(theme)

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

  return (
    <View style={styles.container}>
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <View style={[styles.button, { borderColor, backgroundColor }]}>
            <Text>Add text</Text>
          </View>
        </ContextMenu.Trigger>

        <ContextMenu.Content>
          <ContextMenu.Item key="add-to-list" onSelect={addToList}>
            <ContextMenu.ItemTitle>Add to List</ContextMenu.ItemTitle>
          </ContextMenu.Item>

          <ContextMenu.Sub>
            <ContextMenu.SubTrigger key="recipes-trigger">
              <ContextMenu.ItemTitle>Add to Recipes</ContextMenu.ItemTitle>
            </ContextMenu.SubTrigger>

            <ContextMenu.SubContent>
              {userRecipes.map((recipe) => (
                <ContextMenu.Item
                  key={recipe.id}
                  onSelect={() => addToRecipe(recipe)}
                >
                  <ContextMenu.ItemTitle>{recipe.title}</ContextMenu.ItemTitle>
                </ContextMenu.Item>
              ))}
            </ContextMenu.SubContent>
          </ContextMenu.Sub>
        </ContextMenu.Content>
      </ContextMenu.Root>
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
