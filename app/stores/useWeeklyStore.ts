import { create } from "zustand"
import { CronProduct } from "@/types/cron"

type WeeklyState = {
    cronProducts: CronProduct[]
    setCronProducts: (products: CronProduct[]) => void
}

export const useWeeklyStore = create<WeeklyState>((set) => ({
    cronProducts: [],

    setCronProducts: (cronProducts) => set({ cronProducts }),
}))
