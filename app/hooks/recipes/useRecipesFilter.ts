import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { MealType } from "@/types/generated/models/meal_type"
import { BottomSheetRef } from "@/components/native/bottom-sheet/appBottomSheet"

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

    // One entry per active filter, so the label and the FAB badge cannot drift apart.
    const parts = useMemo(() => {
        if (!activeFilter) return []

        const next: string[] = []

        if (activeFilter.mealType !== "Any") {
            next.push(activeFilter.mealType)
        }

        if (!activeFilter.public) {
            next.push("Private")
        }

        if (activeFilter.country && activeFilter.country !== "Any") {
            next.push(activeFilter.country)
        }

        if (activeFilter.time) {
            next.push(`≤ ${activeFilter.time} min`)
        }

        if (activeFilter.isSaved) {
            next.push("Online Recipes")
        }

        return next
    }, [activeFilter])

    const label = useMemo(() => {
        if (!activeFilter) return "Filter"

        return parts.length ? parts.join(", ") : "All"
    }, [activeFilter, parts])

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
            count: parts.length,
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
