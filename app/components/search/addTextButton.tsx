import { View, StyleSheet } from "react-native"
import type { ItemType, ProductSearch, Recipe } from "@/types"
import { useSettings } from "@/stores/useSettings"
import { getBackgroundColor, getBorderColor } from "@/lib/theme"
import uuid from "react-native-uuid"
import { addItem } from "@/lib/firebase"
import { Host, ContextMenu, Button, Text } from "@expo/ui/swift-ui"
import { getUserRecipes } from "@/lib/recipes"
import { useEffect, useState } from "react"
import AddToRecipeButton from "./addToRecipeButton"

type Props = {
  item: ProductSearch
}

export default function AddTextButton({ item }: Props) {
  const { theme, user } = useSettings()
  const [recipes, setRecipes] = useState<Recipe[]>([])

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

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user) return
      const data = await getUserRecipes(user)
      setRecipes(data)
    }
    fetchRecipes()
  }, [user])

  return (
    <View style={styles.container}>
      <Host matchContents>
        <ContextMenu>
          <ContextMenu.Items>
            <Button label="Add to List" onPress={addToList} />

            <ContextMenu>
              <ContextMenu.Items>
                {recipes.map((recipe) => (
                  <AddToRecipeButton
                    recipe={recipe}
                    type="text"
                    item={item.item}
                  />
                ))}
              </ContextMenu.Items>
              <ContextMenu.Trigger>
                <Button label="Add to Recipes" />
              </ContextMenu.Trigger>
            </ContextMenu>
          </ContextMenu.Items>

          <ContextMenu.Trigger>
            <View style={[styles.button, { borderColor, backgroundColor }]}>
              <Text>Add text</Text>
            </View>
          </ContextMenu.Trigger>
        </ContextMenu>
      </Host>
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
