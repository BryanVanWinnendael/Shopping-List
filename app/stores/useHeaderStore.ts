import { create } from "zustand"

type HeaderState = {
    text: string | null

    setText: (val: string | null) => void
}

export const useHeaderStore = create<HeaderState>((set) => ({
    text: null,

    setText: (val: string | null) => {
        set({ text: val })
    },
}))
