import { create } from "zustand"

// route name
type HeaderKey = "searchProducts" | "logs" | "recipes" | "online-recipes"

type HeaderState = {
    headers: Record<HeaderKey, string | null>
    setText: (key: HeaderKey, value: string | null) => void
    getText: (key: HeaderKey) => string | null
}

export const useHeaderStore = create<HeaderState>((set, get) => ({
    headers: {
        searchProducts: null,
        logs: null,
        recipes: null,
        "online-recipes": null,
    },

    setText: (key, value) => {
        set((state) => ({
            headers: {
                ...state.headers,
                [key]: value,
            },
        }))
    },

    getText: (key) => {
        return get().headers[key]
    },
}))
