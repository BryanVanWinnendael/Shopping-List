import { useState } from "react"

import { recipesClient } from "@/lib/recipes"
import { CreateRecipeRequest, Ingredient } from "@/types/recipes"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { storageClient } from "@/lib/storage"
import uuid from "react-native-uuid"

export function useCreateRecipe() {
    const { addRecipe } = useRecipesStore()

    const [loading, setLoading] = useState(false)

    const uploadIngredients = async (id: string, ingredients: Ingredient[]) => {
        return Promise.all(
            ingredients.map(async (ingredient) => {
                if (!ingredient.image) {
                    return {
                        product: ingredient.product,
                        type: ingredient.type,
                        url: null,
                    }
                }

                const response = await storageClient.uploadRecipeImage(ingredient.image, id)

                return {
                    product: ingredient.product,
                    type: ingredient.type,
                    url: response?.large ?? null,
                }
            })
        )
    }

    const mapImages = async (request: CreateRecipeRequest): Promise<CreateRecipeRequest | null> => {
        if (!request.title || !request.user) return null

        const id = uuid.v4()

        let bannerImage = request.banner
        if (request.image) {
            const response = await storageClient.uploadRecipeImage(request.image, id)
            bannerImage = response?.large ?? ""
        }
        const mappedIngredients = await uploadIngredients(id, request.ingredients)

        return {
            id,
            title: request.title,
            public: request.public,
            banner: bannerImage,
            instructions: request.instructions,
            source: request.source,
            ingredients: mappedIngredients,
            country: request.country,
            mealType: request.mealType,
            time: request.time,
            user: request.user,
            persons: request.persons,
        }
    }

    const createRecipe = async (createRecipeRequest: CreateRecipeRequest) => {
        const mappedCreateRecipeRequest = await mapImages(createRecipeRequest)
        if (!mappedCreateRecipeRequest) return null

        const response = await recipesClient.createRecipe(mappedCreateRecipeRequest)
        if (response) {
            addRecipe(response)
        }

        return response
    }

    return {
        states: {
            loading,
        },
        actions: {
            createRecipe,
            setLoading,
        },
    }
}
