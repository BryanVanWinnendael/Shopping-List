import { UpdateRecipeRequest } from "@/types/recipes"
import { recipesClient } from "@/lib/recipes"
import { useState } from "react"
import { storageClient } from "@/lib/storage"
import { DeleteImageRequest } from "@/types/storage"

export function useUpdateRecipe() {
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

        const mappedIngredients = await uploadIngredientsImages(request.id, request.ingredients)

        await deleteImages(imagesToDelete, request.id)

        const finalRequest: UpdateRecipeRequest = {
            ...request,
            banner: bannerUrl,
            ingredients: mappedIngredients,
        }

        return await recipesClient.updateRecipe(finalRequest.id, finalRequest)
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
