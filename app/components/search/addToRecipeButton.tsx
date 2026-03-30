import { Recipe } from "@/types"
import { useSettings } from "@/stores/useSettings"
import { Button } from "@expo/ui/swift-ui"
import { editRecipe } from "@/lib/recipes"

type Props = {
  recipe: Recipe
  type: "text" | "image"
  item: string
}

export default function AddToRecipeButton({ recipe, type, item }: Props) {
  const { user } = useSettings()

  const addToRecipe = async () => {
    if (!user || !recipe) return

    const toAdd = {
      type,
      item: type === "text" ? item : "",
      ...(type === "image" && { url: item }),
    }

    const updatedRecipe: Recipe = {
      ...recipe,
      list: [...(recipe.list ?? []), toAdd],
    }

    await editRecipe(updatedRecipe)
  }

  return <Button key={recipe.id} label={recipe.title} onPress={addToRecipe} />
}
