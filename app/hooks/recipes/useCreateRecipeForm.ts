import { useCallback, useRef, useState } from "react"
import * as ImagePicker from "expo-image-picker"
import { Country, CreateRecipeRequest, Ingredient } from "@/types/recipes"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { MealType } from "@/types/generated/models/meal_type"
import { BottomSheetRef } from "@/components/native/bottom-sheet/appBottomSheet"

export function useCreateRecipeForm() {
    const { user } = useSettingsStore()

    const bottomSheetRef = useRef<BottomSheetRef>(null)

    const [title, setTitle] = useState("")
    const [publicRecipe, setPublicRecipe] = useState(true)

    const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null)
    const [banner, setBanner] = useState<string | null>(null)

    const [instructions, setInstructions] = useState<string[]>([])
    const [source, setSource] = useState("")

    const [ingredients, setIngredients] = useState<Ingredient[]>([])

    const [countryObject, setCountryObject] = useState<Country | null>(null)
    const [mealType, setMealType] = useState<MealType>("Any")
    const [time, setTime] = useState<number>(0)
    const [persons, setPersons] = useState<number>(0)

    const open = useCallback(() => {
        bottomSheetRef.current?.expand()
    }, [])

    const close = useCallback(() => {
        bottomSheetRef.current?.close()
    }, [])

    const addInstruction = useCallback(() => {
        setInstructions((prev) => [...prev, ""])
    }, [])

    const updateInstruction = useCallback((index: number, value: string) => {
        setInstructions((prev) => {
            const updated = [...prev]
            updated[index] = value
            return updated
        })
    }, [])

    const removeInstruction = useCallback((index: number) => {
        setInstructions((prev) => prev.filter((_, i) => i !== index))
    }, [])

    const addIngredient = useCallback(() => {
        setIngredients((prev) => [
            ...prev,
            {
                product: "",
                type: "text",
            },
        ])
    }, [])

    const updateIngredient = useCallback((index: number, field: keyof Ingredient, value: any) => {
        setIngredients((prev) => {
            const updated = [...prev]
            updated[index] = {
                ...updated[index],
                [field]: value,
            }
            return updated
        })
    }, [])

    const removeIngredient = useCallback((index: number) => {
        setIngredients((prev) => prev.filter((_, i) => i !== index))
    }, [])

    const setBannerImage = useCallback((uri: string | null, image: ImagePicker.ImagePickerAsset | null) => {
        setBanner(uri)
        setImage(image)
    }, [])

    const reset = useCallback(() => {
        setTitle("")
        setPublicRecipe(true)
        setBanner(null)
        setImage(null)
        setInstructions([])
        setSource("")
        setIngredients([])
        setCountryObject(null)
        setMealType("Any")
        setTime(0)
        setPersons(0)
    }, [])

    const getCreateRecipeRequest = useCallback((): CreateRecipeRequest | null => {
        if (!title || !user) {
            return null
        }

        return {
            user,
            title,
            public: publicRecipe,
            image,
            instructions,
            source,
            mealType,
            country: countryObject ? `${countryObject.flag} ${countryObject.name}` : null,
            time,
            ingredients,
            persons,
        }
    }, [user, title, publicRecipe, image, instructions, source, mealType, countryObject, time, ingredients, persons])

    return {
        states: {
            title,
            publicRecipe,
            banner,
            image,
            instructions,
            source,
            ingredients,
            countryObject,
            mealType,
            time,
            persons,
        },

        actions: {
            setTitle,
            setPublicRecipe,
            setBannerImage,
            addInstruction,
            removeInstruction,
            updateInstruction,
            setSource,
            setCountryObject,
            setMealType,
            setTime,
            addIngredient,
            updateIngredient,
            removeIngredient,
            reset,
            getCreateRecipeRequest,
            close,
            open,
            setPersons,
        },

        refs: {
            bottomSheetRef,
        },
    }
}
