import { useAiContextStore } from "@/stores/useAiContextStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { ChatContext } from "@/types/ai"

// Cap list snapshots so requests stay far under per-minute token budgets
// and on-device models stay within their context window.
const MAX_ITEMS = 100

export function getAiContext(pathname: string): ChatContext {
    const { products, recipes, recipe, weeklyProducts, onlineRecipes, onlineRecipe, searchSnapshot } =
        useAiContextStore.getState()

    if (pathname === "/") {
        const items = products ? Object.values(products) : []

        return {
            type: "shopping-list",
            items: items.slice(0, MAX_ITEMS * 2).map((item) => item.name),
        }
    }

    if (pathname === "/recipes") {
        return {
            type: "recipes",
            items: (recipes ?? []).slice(0, MAX_ITEMS * 2).map((item) => ({ id: item.id, title: item.title })),
        }
    }

    if (/^\/recipes\/[^/]+$/.test(pathname)) {
        return {
            type: "recipe",
            recipe,
        }
    }

    if (pathname === "/weekly" || pathname === "/weeklyCategories") {
        return {
            type: "weekly-products",
            items: weeklyProducts
                .slice(0, MAX_ITEMS)
                .map((item) => ({ product: item.product, category: item.category, user: item.user })),
        }
    }

    if (pathname === "/online-recipes") {
        return {
            type: "online-recipes",
            items: onlineRecipes.slice(0, MAX_ITEMS).map((item) => ({ title: item.title, url: item.url })),
        }
    }

    if (pathname === "/online-recipes/details") {
        return {
            type: "online-recipe",
            recipe: onlineRecipe,
        }
    }

    if (pathname === "/searchProducts") {
        return {
            type: "search-products",
            query: searchSnapshot?.query ?? "",
            items: (searchSnapshot?.products ?? [])
                .slice(0, MAX_ITEMS)
                .map((item) => ({ name: item.name, brand: item.brand, category: item.category })),
        }
    }

    if (pathname === "/settings") {
        const { theme, user } = useSettingsStore.getState()
        return {
            type: "settings",
            theme,
            user,
        }
    }

    return {
        type: "none",
    }
}
