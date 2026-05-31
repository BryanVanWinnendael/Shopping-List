import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { MealType } from "@/types/recipes"
import BottomSheet from "@gorhom/bottom-sheet"

export function useRecipesFilter() {
    const { activeFilter, updateFilter, setActiveFilter } = useRecipesStore()

    const bottomSheetRef = useRef<BottomSheet>(null)

    const [mealType, setMealType] = useState<MealType>("Any")
    const [isPublic, setIsPublic] = useState(true)
    const [country, setCountry] = useState<string>("Any")
    const [time, setTime] = useState<number | null>(null)

    const open = useCallback(() => {
        bottomSheetRef.current?.expand()
    }, [])

    const close = useCallback(() => {
        bottomSheetRef.current?.close()
    }, [])

    const apply = () => {
        updateFilter({
            mealType,
            public: isPublic,
            country,
            time,
        })
    }

    const clear = async () => {
        const reset = {
            mealType: "Any" as MealType,
            public: true,
            country: "Any",
            time: null,
        }

        setMealType(reset.mealType)
        setIsPublic(reset.public)
        setCountry(reset.country)
        setTime(reset.time)

        await setActiveFilter(reset)
    }

    const label = useMemo(() => {
        if (!activeFilter) return "Filter"

        const parts: string[] = []

        if (activeFilter.mealType !== "Any") {
            parts.push(activeFilter.mealType)
        }

        if (!activeFilter.public) {
            parts.push("My Recipes")
        }

        if (activeFilter.country && activeFilter.country !== "Any") {
            parts.push(activeFilter.country)
        }

        if (activeFilter.time) {
            parts.push(`≤ ${activeFilter.time} min`)
        }

        return parts.length ? parts.join(", ") : "All"
    }, [activeFilter])

    useEffect(() => {
        setMealType(activeFilter.mealType)
        setIsPublic(activeFilter.public)
        setCountry(activeFilter.country)
        setTime(activeFilter.time)
    }, [activeFilter])

    return {
        states: {
            mealType,
            isPublic,
            country,
            time,
            label,
        },
        actions: {
            setMealType,
            setIsPublic,
            setCountry,
            setTime,
            apply,
            clear,
            open,
            close,
        },
        refs: {
            bottomSheetRef,
        },
    }
}
