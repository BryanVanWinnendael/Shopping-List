import { View } from "react-native"
import { useSettings } from "@/stores/useSettings"
import { getBackgroundColor } from "@/lib/theme"
import RecipesList from "@/components/recipes/recipesList"
import { AddRecipe } from "@/components/recipes/addRecipe"
import { useCallback, useEffect } from "react"
import { getRecipes, getUserRecipes } from "@/lib/recipes"
import { FilterButton } from "@/components/recipes/filter/filterButton"
import { useInteractions } from "@/stores/useInteractions"
import { useRecipes } from "@/stores/useRecipes"

export default function Recipes() {
  const { theme, user } = useSettings()
  const { setRecipes } = useRecipes()
  const { updateRecipes, setUpdateRecipes } = useInteractions()

  const fetchRecipes = useCallback(async () => {
    if (!user) return

    const data = await getRecipes()
    const filteredData = data.filter((recipe) => recipe.createdBy !== user)
    const userData = await getUserRecipes(user)

    const cData = [...filteredData, ...userData]

    if (cData) {
      setRecipes(cData, user)
    }
  }, [user])

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  useEffect(() => {
    if (updateRecipes) {
      fetchRecipes()
      setUpdateRecipes(false)
    }
  }, [updateRecipes])

  return (
    <View
      style={{
        backgroundColor: getBackgroundColor(theme),
        flex: 1,
        padding: 16,
      }}
    >
      <RecipesList fetchRecipes={fetchRecipes} />
      <AddRecipe fetchRecipes={fetchRecipes} />
      <FilterButton />
    </View>
  )
}
