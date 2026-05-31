import { useState } from "react"
import { View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"
import useOnlineRecipes from "@/hooks/recipes/useOnlineRecipes"
import { List } from "@/components/online-recipes/list"
import StyleButton from "@/components/online-recipes/styleButton"
import SearchBar from "@/components/online-recipes/searchBar"

export default function OnlineRecipes() {
    const { vars } = useThemes()
    const { actions, states } = useOnlineRecipes()

    const [searchFocused, setSearchFocused] = useState(false)

    return (
        <View
            style={{
                backgroundColor: vars.backgroundColor,
                flex: 1,
                padding: 16,
            }}
        >
            <List
                loading={states.loading}
                onEndReached={actions.getNextPage}
                results={states.recipes}
                variant={states.style}
            />

            <StyleButton value={states.style} setStyle={actions.setStyle} collapsed={searchFocused} />

            <SearchBar
                value={states.query}
                onChange={actions.updateQuery}
                focused={searchFocused}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
            />
        </View>
    )
}
