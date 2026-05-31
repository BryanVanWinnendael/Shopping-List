import { useCallback, useRef, useState } from "react"
import * as ImagePicker from "expo-image-picker"
import { Country, CreateRecipeRequest, Ingredient, MealType } from "@/types/recipes"
import BottomSheet from "@gorhom/bottom-sheet"
import { useSettingsStore } from "@/stores/useSettingsStore"

export function useCreateRecipeForm() {
    const { user } = useSettingsStore()
    const bottomSheetRef = useRef<BottomSheet>(null)

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

    const addInstruction = () => {
        setInstructions((prev) => [...prev, ""])
    }

    const updateInstruction = (index: number, value: string) => {
        setInstructions((prev) => {
            const updated = [...prev]
            updated[index] = value
            return updated
        })
    }

    const removeInstruction = (index: number) => {
        setInstructions((prev) => prev.filter((_, i) => i !== index))
    }

    const addIngredient = () => {
        setIngredients((prev) => [...prev, { product: "", type: "text" }])
    }

    const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
        setIngredients((prev) => {
            const updated = [...prev]
            updated[index] = { ...updated[index], [field]: value }
            return updated
        })
    }

    const removeIngredient = (index: number) => {
        setIngredients((prev) => prev.filter((_, i) => i !== index))
    }

    const setBannerImage = (uri: string | null, image: ImagePicker.ImagePickerAsset | null) => {
        setBanner(uri)
        setImage(image)
    }

    const reset = () => {
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
    }

    const getCreateRecipeRequest = (): CreateRecipeRequest | null => {
        if (!title || !user) return null

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
    }

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
