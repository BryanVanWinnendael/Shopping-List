import { useAiContextStore } from "@/stores/useAiContextStore"
import { ChatContext } from "@/types/ai"

export function getAiContext(pathname: string): ChatContext {
    const { products, recipes, recipe } = useAiContextStore.getState()

    if (pathname === "/") {
        return {
            type: "shopping-list",
            products,
        }
    }

    if (pathname === "/recipes") {
        return {
            type: "recipes",
            recipes,
        }
    }

    if (/^\/recipes\/[^/]+$/.test(pathname)) {
        return {
            type: "recipe",
            recipe,
        }
    }

    return {
        type: "none",
    }
}
