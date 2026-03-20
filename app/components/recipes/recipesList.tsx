import { useEffect, useState, useMemo, useRef } from "react"
import { Text, FlatList, RefreshControl, StyleSheet } from "react-native"
import { useSettings } from "@/stores/useSettings"
import { useHeaderHeight } from "@react-navigation/elements"
import { deleteRecipe } from "@/lib/recipes"
import { deleteRecipeStorage } from "@/lib/storage"
import RecipeCard from "./recipeCard"
import { Recipe } from "@/types"
import { useRecipes } from "@/stores/useRecipes"
import { useInteractions } from "@/stores/useInteractions"

type ListItem =
  | { type: "section"; title: string }
  | { type: "recipe"; recipe: Recipe }

type Props = {
  fetchRecipes: () => Promise<void>
}

export default function RecipesList({ fetchRecipes }: Props) {
  const { theme, user, aColor } = useSettings()
  const { recipes, storedRecipes, favoriteRecipes, setFavoriteRecipes } =
    useRecipes()
  const { activeFilter, filter } = useRecipes()
  const { setError } = useInteractions()
  const headerHeight = useHeaderHeight()

  const flatListRef = useRef<FlatList<ListItem>>(null)

  // Local state to decide what to display: cached first
  const [displayRecipes, setDisplayRecipes] = useState<Recipe[]>(
    storedRecipes || [],
  )
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (recipes.length > 0) {
      setDisplayRecipes(recipes)
    }
  }, [recipes])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchRecipes()
    setRefreshing(false)
  }

  const handleDelete = async (item: Recipe) => {
    if (!item) return
    const successStorage = await deleteRecipeStorage(item.id)
    if (!successStorage) setError("Failed to delete recipe images")
    const success = await deleteRecipe(item.id)
    if (!success) setError("Failed to delete recipe")
    onRefresh()
  }

  const handleAddToFavorites = async (id: string) => {
    if (favoriteRecipes.includes(id)) {
      setFavoriteRecipes(favoriteRecipes.filter((r) => r !== id))
    } else {
      setFavoriteRecipes([...favoriteRecipes, id])
    }
  }

  const { favoriteList, myRecipes, publicRecipes } = useMemo(() => {
    let favs =
      displayRecipes?.filter((r) => favoriteRecipes.includes(r.id)) || []
    let mine =
      displayRecipes
        ?.filter((r) => r.created_by === user)
        ?.filter((r) => !favoriteRecipes.includes(r.id)) || []
    let publicR =
      displayRecipes
        ?.filter((r) => r.created_by !== user)
        ?.filter((r) => !favoriteRecipes.includes(r.id)) || []

    if (activeFilter && filter) {
      if (activeFilter.mealType && activeFilter.mealType !== "Any") {
        mine = mine.filter(
          (r) =>
            r.meal_type?.toLowerCase() === activeFilter.mealType?.toLowerCase(),
        )
        publicR = publicR.filter(
          (r) =>
            r.meal_type?.toLowerCase() === activeFilter.mealType?.toLowerCase(),
        )
      }
      if (activeFilter.public === false) {
        mine = mine.filter((r) => r.created_by === user)
        publicR = []
      }
      if (activeFilter.public === true) {
        mine = mine.filter((r) => r.created_by === user)
        publicR = publicR.filter((r) => r.created_by !== user)
      }
      if (
        activeFilter.country &&
        activeFilter.country !== "" &&
        activeFilter.country !== "Any"
      ) {
        mine = mine.filter(
          (r) =>
            r.country?.toLowerCase() === activeFilter.country?.toLowerCase(),
        )
        publicR = publicR.filter(
          (r) =>
            r.country?.toLowerCase() === activeFilter.country?.toLowerCase(),
        )
      }
      if (activeFilter.time && Number(activeFilter.time) > 0) {
        mine = mine.filter((r) => Number(r.time) <= Number(activeFilter.time))
        publicR = publicR.filter(
          (r) => Number(r.time) <= Number(activeFilter.time),
        )
      }
    }

    return { favoriteList: favs, myRecipes: mine, publicRecipes: publicR }
  }, [displayRecipes, favoriteRecipes, activeFilter, filter])

  const data: ListItem[] = useMemo(() => {
    const arr: ListItem[] = []
    if (favoriteList.length > 0) {
      arr.push({ type: "section", title: "Favorite Recipes" })
      favoriteList.forEach((r) => arr.push({ type: "recipe", recipe: r }))
    }
    if (myRecipes.length > 0) {
      arr.push({ type: "section", title: "My Recipes" })
      myRecipes.forEach((r) => arr.push({ type: "recipe", recipe: r }))
    }
    if (publicRecipes.length > 0) {
      arr.push({ type: "section", title: "Public Recipes" })
      publicRecipes.forEach((r) => arr.push({ type: "recipe", recipe: r }))
    }
    return arr
  }, [favoriteList, myRecipes, publicRecipes])

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true })
    }
  }, [data])

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === "section") {
      return (
        <Text
          style={[
            styles.sectionTitle,
            {
              color: aColor,
              backgroundColor: `${aColor}33`,
              borderRadius: 24,
              marginBottom: 16,
              paddingHorizontal: 12,
              paddingVertical: 6,
              alignSelf: "flex-start",
            },
          ]}
        >
          {item.title}
        </Text>
      )
    }
    if (item.type === "recipe") {
      return (
        <RecipeCard
          key={item.recipe.id}
          item={item.recipe}
          favoriteRecipes={favoriteRecipes}
          onDelete={handleDelete}
          onToggleFavorite={handleAddToFavorites}
        />
      )
    }
    return null
  }

  return (
    <FlatList
      ref={flatListRef}
      data={data}
      keyExtractor={(item, index) =>
        item.type === "section"
          ? `section-${item.title}-${index}`
          : `recipe-${item.recipe.id}-${index}`
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: headerHeight,
        paddingBottom: headerHeight + 60,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme === "light" ? "black" : "white"}
          colors={[theme === "light" ? "black" : "white"]}
          style={{ backgroundColor: "transparent" }}
          progressViewOffset={headerHeight}
        />
      }
      renderItem={renderItem}
    />
  )
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    paddingHorizontal: 8,
    marginBottom: 8,
  },
})
