import { create } from "zustand"

// route name
type HeaderKey = "searchProducts" | "logs" | "recipes" | "online-recipes"

type HeaderState = {
    headers: Record<HeaderKey, string | null>
    setHeaderText: (key: HeaderKey, value: string | null) => void
    getHeaderText: (key: HeaderKey) => string | null
}

export const useHeaderStore = create<HeaderState>((set, get) => ({
    headers: {
        searchProducts: "Search Products",
        logs: "Logs",
        recipes: "Recipes",
        "online-recipes": "Online Recipes",
    },

    setHeaderText: (key, value) => {
        set((state) => ({
            headers: {
                ...state.headers,
                [key]: value,
            },
        }))
    },

    getHeaderText: (key) => {
        return get().headers[key]
    },
}))
