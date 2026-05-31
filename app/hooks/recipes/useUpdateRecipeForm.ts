import { useCallback, useEffect, useRef, useState } from "react"
import BottomSheet from "@gorhom/bottom-sheet"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { Country, Ingredient, MealType, Recipe, UpdateRecipeRequest } from "@/types/recipes"
import * as ImagePicker from "expo-image-picker"

function convertToCountry(countryStr?: string | null): Country | null {
    if (!countryStr) return null
    const [flag, name] = countryStr.split(" ")
    return { flag, name }
}

export function useUpdateRecipeForm(recipe: Recipe) {
    const { user } = useSettingsStore()

    const bottomSheetRef = useRef<BottomSheet>(null)

    const [title, setTitle] = useState<string>(recipe.title)
    const [publicRecipe, setPublicRecipe] = useState<boolean>(recipe.public ?? true)

    const [banner, setBanner] = useState<string | ImagePicker.ImagePickerAsset | null>(recipe.banner || null)

    const [instructions, setInstructions] = useState<string[]>(recipe.instructions || [])
    const [source, setSource] = useState(recipe.source || "")

    const [countryObject, setCountryObject] = useState<Country | null>(convertToCountry(recipe.country))
    const [mealType, setMealType] = useState<MealType>(recipe.mealType || "Any")
    const [time, setTime] = useState<number>(recipe.time || 0)
    const [persons, setPersons] = useState<number>(recipe.persons || 0)

    const [ingredients, setIngredients] = useState<Ingredient[]>(recipe.ingredients || [])

    const [imagesToDelete, setImagesToDelete] = useState<string[]>([])

    const open = useCallback(() => {
        bottomSheetRef.current?.expand()
    }, [])

    const close = useCallback(() => {
        bottomSheetRef.current?.close()
    }, [])

    const createInstruction = () => {
        setInstructions((prev) => [...prev, ""])
    }

    const updateInstruction = (index: number, value: string) => {
        setInstructions((prev) => {
            const updated = [...prev]
            updated[index] = value
            return updated
        })
    }

    const deleteInstruction = (index: number) => {
        setInstructions((prev) => prev.filter((_, i) => i !== index))
    }

    const createIngredient = () => {
        setIngredients((prev) => [...prev, { product: "", type: "text" }])
    }

    const updateIngredient = (index: number, updates: Partial<Ingredient>) => {
        setIngredients((prev) => {
            const copy = [...prev]
            copy[index] = { ...copy[index], ...updates }
            return copy
        })
    }

    const deleteIngredientImage = (index: number) => {
        setIngredients((prev) => {
            const copy = [...prev]
            const product = copy[index]
            if (product.url) {
                setImagesToDelete((images) => [...images, product.url!])
            }

            copy[index] = {
                ...product,
                image: undefined,
                url: null,
                type: "text",
            }

            return copy
        })
    }

    const deleteIngredient = (index: number) => {
        setIngredients((prev) => {
            const product = prev[index]

            if (product?.url) {
                setImagesToDelete((images) => [...images, product.url!])
            }

            return prev.filter((_, i) => i !== index)
        })
    }

    const setBannerImage = (uri: string | null, image: ImagePicker.ImagePickerAsset | null) => {
        if (typeof banner === "string") {
            setImagesToDelete((prev) => [...prev, banner])
        }

        setBanner(image ?? uri)
    }

    const getImageFields = (banner: string | ImagePicker.ImagePickerAsset | null) => {
        // banner removed
        if (!banner) {
            return {
                image: null,
                newBanner: "",
            }
        }

        if (typeof banner === "string") {
            return {
                image: null,
                newBanner: banner, // already uploaded URL
            }
        }

        return {
            image: banner, // needs upload
            newBanner: null,
        }
    }

    useEffect(() => {
        if (!recipe) return

        setTitle(recipe.title)
        setPublicRecipe(recipe.public ?? true)
        setBanner(recipe.banner || null)
        setInstructions(recipe.instructions || [])
        setSource(recipe.source || "")
        setCountryObject(convertToCountry(recipe.country))
        setMealType(recipe.mealType || "Any")
        setTime(recipe.time || 0)
        setIngredients(recipe.ingredients || [])
        setPersons(recipe.persons || 0)
    }, [recipe])

    const getUpdateRecipeRequest = (): UpdateRecipeRequest | null => {
        if (!title.trim() || !user) return null
        const { image, newBanner } = getImageFields(banner)

        return {
            id: recipe.id,
            title,
            public: publicRecipe,
            image,
            banner: newBanner,
            instructions,
            source,
            mealType,
            country: countryObject ? `${countryObject.flag} ${countryObject.name}` : null,
            time,
            ingredients,
            user,
            persons,
        }
    }

    return {
        states: {
            title,
            publicRecipe,
            instructions,
            source,
            countryObject,
            mealType,
            time,
            ingredients,
            banner,
            imagesToDelete,
            persons,
        },
        actions: {
            setTitle,
            setPublicRecipe,
            updateInstruction,
            createInstruction,
            deleteInstruction,
            setSource,
            setCountryObject,
            setMealType,
            setPersons,
            setTime,
            createIngredient,
            updateIngredient,
            deleteIngredientImage,
            deleteIngredient,
            setBannerImage,
            getUpdateRecipeRequest,
            close,
            open,
        },
        refs: {
            bottomSheetRef,
        },
    }
}
