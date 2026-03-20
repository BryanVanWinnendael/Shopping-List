import { create } from "zustand"
import { sendNotification } from "@/lib/notifications"
import {
  Items,
  NotificationTypes,
  ProductsSearchResult,
  Toasts,
  Users,
} from "@/types"
import { RefObject } from "react"
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types"

type InteractionsState = {
  items: Items | null
  setItems: (items: Items) => void
  addedItem: boolean
  setAddedItem: (added: boolean) => void
  handleNotification: (type: NotificationTypes, user: Users | null) => void
  error: Toasts | null
  setError: (val: Toasts | null) => void
  updateRecipes: boolean
  setUpdateRecipes: (val: boolean) => void
  searchSheet: RefObject<BottomSheetMethods | null> | null
  setSearchSheet: (ref: RefObject<BottomSheetMethods | null> | null) => void
  searchItems: string | null
  setSearchItems: (items: string | null) => void
  searchItemsResult: ProductsSearchResult
  setSearchItemsResult: (items: ProductsSearchResult) => void
}

export const useInteractions = create<InteractionsState>((set, get) => ({
  items: null,
  addedItem: false,
  error: null,
  updateRecipes: false,
  searchSheet: null,
  searchItemsResult: { products: [], dateUpdated: "" },
  searchItems: null,

  setItems: (items) => set({ items }),

  setAddedItem: (added: boolean) => {
    set({ addedItem: added })
  },

  handleNotification: async (type, user) => {
    const { addedItem } = get()

    if (addedItem) return
    set({ addedItem: true })
    if (user) {
      const success = await sendNotification(type, user)
      if (!success) set({ error: "Failed to sent notification" })
    }
  },

  setError: (val: Toasts | null) => {
    set({ error: val })
  },

  setUpdateRecipes: (val: boolean) => {
    set({ updateRecipes: val })
  },

  setSearchSheet: (ref: RefObject<BottomSheetMethods | null> | null) => {
    set({ searchSheet: ref })
  },

  setSearchItemsResult: (items: ProductsSearchResult) => {
    set({ searchItemsResult: items })
  },

  setSearchItems: (items: string | null) => {
    set({ searchItems: items })
  },
}))
