import { create } from "zustand"
import { Products } from "@/types/list"

type ListState = {
    products: Products | null
    setProducts: (products: Products) => void
    addedProduct: boolean
    setAddedProduct: (added: boolean) => void
}

export const useProductsListStore = create<ListState>((set) => ({
    products: null,
    addedProduct: false,

    setProducts: (products) => set({ products }),

    setAddedProduct: (added: boolean) => {
        set({ addedProduct: added })
    },
}))
