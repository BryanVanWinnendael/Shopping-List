import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { MealType } from "@/types/generated/models/meal_type"
import { BottomSheetRef } from "@/components/native/appBottomSheet"

export function useRecipesFilter() {
    const { activeFilter, updateFilter, setActiveFilter } = useRecipesStore()

    const bottomSheetRef = useRef<BottomSheetRef>(null)

    const [mealType, setMealType] = useState<MealType>("Any")
    const [isPublic, setIsPublic] = useState(true)
    const [country, setCountry] = useState<string | undefined>("Any")
    const [time, setTime] = useState<number | null | undefined>(null)

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
            parts.push("Private")
        }

        if (activeFilter.country && activeFilter.country !== "Any") {
            parts.push(activeFilter.country)
        }

        if (activeFilter.time) {
            parts.push(`≤ ${activeFilter.time} min`)
        }

        if (activeFilter.isSaved) {
            parts.push("Online Recipes")
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
