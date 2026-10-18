import { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"
import useOnlineRecipes from "@/hooks/recipes/useOnlineRecipes"
import { List } from "@/components/online-recipes/list"
import StyleButton from "@/components/online-recipes/styleButton"
import SearchBar from "@/components/online-recipes/searchBar"
import OnlineRecipeFilters from "@/components/online-recipes/onlineRecipeFilters"
import { useAiContextStore } from "@/stores/useAiContextStore"

export default function OnlineRecipes() {
    const { vars } = useThemes()
    const { actions, states } = useOnlineRecipes()
    const setOnlineRecipes = useAiContextStore((state) => state.setOnlineRecipes)

    useEffect(() => {
        setOnlineRecipes(states.recipes)
    }, [states.recipes, setOnlineRecipes])

    const [searchFocused, setSearchFocused] = useState(false)

    return (
        <View style={[styles.container, { backgroundColor: vars.backgroundColor }]}>
            <List
                loading={states.loading}
                refreshing={states.refreshing}
                onEndReached={actions.getNextPage}
                onRefresh={actions.refresh}
                results={states.recipes}
                variant={states.style}
            />

            <SearchBar
                value={states.query}
                onChange={actions.updateQuery}
                focused={searchFocused}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
            />

            <StyleButton value={states.style} setStyle={actions.setStyle} collapsed={searchFocused} />

            <OnlineRecipeFilters filter={states.filter} onApply={actions.setFilters} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 12,
    },
})
