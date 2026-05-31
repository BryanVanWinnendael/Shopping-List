import { useCallback, useEffect, useState } from "react"
import { recipesClient } from "@/lib/recipes"

export default function useRecipesCountries() {
    const [countries, setCountries] = useState<string[]>([])

    const fetchCountries = useCallback(async () => {
        const response = await recipesClient.getRecipesCountries()
        if (response) {
            const filteredCountries = response.filter((country) => country && country.trim() !== "")

            setCountries(["Any", ...filteredCountries])
        }
    }, [])

    useEffect(() => {
        fetchCountries()
    }, [])

    return {
        states: {
            countries,
        },
        actions: {
            fetchCountries,
        },
    }
}
