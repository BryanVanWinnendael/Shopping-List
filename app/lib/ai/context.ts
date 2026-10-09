import { useAiContextStore } from "@/stores/useAiContextStore"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { ChatContext } from "@/types/ai"

// Cap list snapshots so on-device models stay within their context window.
const MAX_ITEMS = 100

export function getAiContext(pathname: string): ChatContext {
    const { products, recipes, recipe, weeklyProducts, onlineRecipes, onlineRecipe, searchSnapshot, logSummary } =
        useAiContextStore.getState()

    if (pathname === "/") {
        return {
            type: "shopping-list",
            products,
        }
    }

    if (pathname === "/recipes") {
        return {
            type: "recipes",
            recipes,
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

    if (pathname === "/logs") {
        return {
            type: "logs",
            total: logSummary?.total ?? 0,
            recentTraceIds: logSummary?.recentTraceIds ?? [],
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
