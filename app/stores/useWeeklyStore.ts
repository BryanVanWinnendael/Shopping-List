import { create } from "zustand"
import { CronProduct } from "@/types/generated/models/cron_product"

type WeeklyState = {
    cronProducts: CronProduct[]
    setCronProducts: (products: CronProduct[]) => void
}

export const useWeeklyStore = create<WeeklyState>((set) => ({
    cronProducts: [],

    setCronProducts: (cronProducts) => set({ cronProducts }),
}))
