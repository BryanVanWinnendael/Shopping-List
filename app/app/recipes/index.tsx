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
import { Recipe } from "@/types"

export default function Recipes() {
  const { theme, user } = useSettings()
  const { setRecipes, userRecipes } = useRecipes()
  const { updateRecipes, setUpdateRecipes } = useInteractions()

  const fetchRecipes = useCallback(
    async (refresh: boolean = false) => {
      if (!user) return

      const data = await getRecipes()
      const filteredData = data.filter((recipe) => recipe.createdBy !== user)

      let userData: Recipe[] = []
      if (userRecipes.length === 0 || refresh) {
        userData = await getUserRecipes(user)
      } else {
        userData = userRecipes
      }

      const cData = [...filteredData, ...userData]

      if (cData) {
        setRecipes(cData, user)
      }
    },
    [user],
  )

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  useEffect(() => {
    if (updateRecipes) {
      fetchRecipes(true)
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
