import { recipesClient } from "@/lib/recipes"
import { storageClient } from "@/lib/storage"
import { useState } from "react"

export default function useDeleteRecipe() {
    const [loading, setLoading] = useState<boolean>(false)

    const deleteRecipe = async (id: string) => {
        const responseStorage = await storageClient.deleteRecipeStorage(id)
        if (!responseStorage) return

        return await recipesClient.deleteRecipe(id)
    }

    return {
        actions: {
            setLoading,
            deleteRecipe,
        },
        states: {
            loading,
        },
    }
}
