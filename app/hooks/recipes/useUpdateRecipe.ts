import { UpdateRecipeRequest } from "@/types/recipes"
import { recipesClient } from "@/lib/recipes"
import { useState } from "react"
import { storageClient } from "@/lib/storage"
import { DeleteImageRequest } from "@/types/generated/contracts/storage"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { RecipeSummary } from "@/types/generated/models/recipe_summary"

export function useUpdateRecipe() {
    const { updateRecipe: updateRecipeStore } = useRecipesStore()

    const [loading, setLoading] = useState(false)

    const uploadIngredientsImages = async (id: string, ingredients: any[]) => {
        return Promise.all(
            ingredients.map(async (ingredient) => {
                if (!ingredient.image) return ingredient

                const res = await storageClient.uploadRecipeImage(ingredient.image, id)

                return {
                    ...ingredient,
                    url: res?.large ?? null,
                }
            })
        )
    }

    const deleteImages = async (imagesToDelete: string[], recipeId: string) => {
        await Promise.all(
            imagesToDelete.map((url) => storageClient.deleteRecipeImage(recipeId, { url } as DeleteImageRequest))
        )
    }

    const updateRecipe = async (request: UpdateRecipeRequest, imagesToDelete: string[]) => {
        let bannerUrl

        if (request.image) {
            const response = await storageClient.uploadRecipeImage(request.image, request.id)
            bannerUrl = response?.large ?? null
        } else {
            bannerUrl = request.banner
        }

        let mappedIngredients
        if (request.ingredients) {
            mappedIngredients = await uploadIngredientsImages(request.id, request.ingredients)
        }

        await deleteImages(imagesToDelete, request.id)

        const finalRequest: UpdateRecipeRequest = {
            ...request,
            banner: bannerUrl,
            ingredients: mappedIngredients,
        }

        const response = await recipesClient.updateRecipe(finalRequest.id, finalRequest)
        if (response) {
            const updatedRecipeSummary: RecipeSummary = {
                id: response.id,
                user: response.user,
                title: response.title,
                public: response.public,
                time: response.time,
                isSaved: response.isSaved,
                banner: response.banner,
                country: response.country,
                mealType: response.mealType,
                persons: response.persons,
            }
            console.log(updatedRecipeSummary)
            updateRecipeStore(updatedRecipeSummary)
        }

        return response
    }

    return {
        states: {
            loading,
        },
        actions: {
            updateRecipe,
            setLoading,
        },
    }
}
