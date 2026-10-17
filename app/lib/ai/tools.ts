import uuid from "react-native-uuid"
import { createProduct as createFirebaseProduct } from "@/lib/firebase"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { Product } from "@/types/list"
import { Category } from "@/types/generated/models/category"
import { ChatContext } from "@/types/ai"

export type AiToolItem = {
    name: string
    category?: string
    recipe?: {
        id: string
        title: string
    } | null
}

const KNOWN_CATEGORIES: Category[] = [
    "bread",
    "drinks",
    "housekeeping",
    "meat",
    "fish",
    "fruit/vegetables",
    "fridge",
    "dairy",
    "world",
    "breakfast",
    "snacks",
    "carbs",
    "sugar/desserts",
    "sauce/spices",
    "preserved",
    "hygiene",
    "freezer",
    "remaining",
]

const coerceCategory = (category?: string | null): Category =>
    category && (KNOWN_CATEGORIES as string[]).includes(category) ? (category as Category) : "remaining"

// Splits a leading amount off an ingredient name: "500 g flour" -> 500, "g", "flour".
// Returns null when the name carries no usable amount.
function parseAmount(raw: string): { value: number; unit: string; name: string } | null {
    const match = raw.trim().match(/^(\d+(?:[.,]\d+)?(?:\s+\d+\s*\/\s*\d+)?|\d+\s*\/\s*\d+)\s*([a-zA-Z]*)\s+(.+)$/)

    if (!match) return null

    const [, amountText, unit, name] = match

    let value: number
    const mixed = amountText.match(/^(\d+(?:[.,]\d+)?)\s+(\d+)\s*\/\s*(\d+)$/)
    const fraction = amountText.match(/^(\d+)\s*\/\s*(\d+)$/)

    if (mixed) {
        const whole = parseFloat(mixed[1].replace(",", "."))
        value = whole + parseFloat(mixed[2]) / parseFloat(mixed[3])
    } else if (fraction) {
        value = parseFloat(fraction[1]) / parseFloat(fraction[2])
    } else {
        value = parseFloat(amountText.replace(",", "."))
    }

    if (!Number.isFinite(value) || !name.trim()) return null

    return { value, unit: unit.trim(), name: name.trim() }
}

const formatAmount = (value: number, unit: string) => {
    const rounded = Math.round(value * 100) / 100
    const text = Number.isInteger(rounded) ? String(rounded) : String(rounded)
    return unit ? `${text} ${unit}`.trim() : text
}

const scaleIngredientName = (raw: string, factor: number) => {
    const parsed = parseAmount(raw)

    if (!parsed) return raw.trim()

    return `${formatAmount(parsed.value * factor, parsed.unit)} ${parsed.name}`
}

async function convertRecipeServings(
    args: { persons?: number },
    context?: { type?: string; recipe?: unknown; onlineRecipe?: unknown }
) {
    const target = typeof args.persons === "number" && args.persons > 0 ? Math.round(args.persons) : null

    if (!target) {
        return { error: "Missing a valid persons count." }
    }

    const type = context?.type
    let title = ""
    let basePersons: number | null = null
    let names: string[] = []

    if (type === "recipe" && context?.recipe) {
        const recipe = context.recipe as {
            title?: string
            persons?: number | null
            ingredients?: { product?: string | null }[] | null
        }
        title = recipe.title ?? ""
        basePersons = recipe.persons ?? null
        names = (recipe.ingredients ?? []).map((item) => item?.product?.trim() ?? "").filter(Boolean)
    } else if (type === "online-recipe" && context?.onlineRecipe) {
        const recipe = context.onlineRecipe as {
            title?: string
            persons?: number | null
            ingredients?: string[] | null
        }
        title = recipe.title ?? ""
        basePersons = recipe.persons ?? null
        names = (recipe.ingredients ?? []).map((item) => item?.trim() ?? "").filter(Boolean)
    } else {
        return { error: "No recipe is open, so there is nothing to convert." }
    }

    if (!basePersons || basePersons <= 0) {
        return { error: "The recipe has no serving size stored, so ask the user what it currently serves." }
    }

    const factor = target / basePersons

    return {
        title,
        fromPersons: basePersons,
        toPersons: target,
        factor: Math.round(factor * 100) / 100,
        items: names.map((name) => ({ name: scaleIngredientName(name, factor) })),
    }
}

async function addToShoppingList(args: {
    items?: { name?: string; category?: string }[]
    product?: string
    category?: string
    recipe?: { id?: string; title?: string } | null
    recipeId?: string
    recipeTitle?: string
}) {
    const user = useSettingsStore.getState().user

    if (!user) {
        return { added: [], failed: [], error: "No user is set, so nothing was added." }
    }

    const items = (args.items ?? (args.product ? [{ name: args.product, category: args.category }] : [])).filter(
        (item) => item?.name?.trim()
    )
    const recipeSource =
        args.recipe ?? (args.recipeId || args.recipeTitle ? { id: args.recipeId, title: args.recipeTitle } : null)
    const recipe = recipeSource?.title ? { id: recipeSource.id ?? recipeSource.title, title: recipeSource.title } : null

    const added: string[] = []
    const failed: string[] = []

    for (const item of items) {
        const name = item.name!.trim().replace(/\.$/, "")

        const product: Product = {
            id: uuid.v4() as string,
            name,
            type: "text",
            user,
            date: Date.now(),
            category: coerceCategory(item.category),
            recipe,
        }

        try {
            await createFirebaseProduct(product)
            added.push(name)
        } catch {
            failed.push(name)
        }
    }

    return { added, failed }
}

export const TOOL_LABELS: Record<string, string> = {
    add_to_shopping_list: "Adding to shopping list",
    convert_recipe_servings: "Converting servings",
}

export const AI_TOOLS = [
    {
        type: "function",
        function: {
            name: "add_to_shopping_list",
            description:
                "Add one or more products to the shopping list. Use exact product names from the context. When the items come from a recipe page, pass that recipe so the items group under it.",
            parameters: {
                type: "object",
                properties: {
                    items: {
                        type: "array",
                        description: "Products to add.",
                        items: {
                            type: "object",
                            properties: {
                                name: { type: "string", description: "Product name, exactly as in the context." },
                                category: { type: "string", description: "Optional category slug." },
                            },
                            required: ["name"],
                        },
                    },
                    recipe: {
                        type: "object",
                        description: "The recipe these items come from, if any.",
                        properties: {
                            id: { type: "string" },
                            title: { type: "string" },
                        },
                    },
                },
                required: ["items"],
            },
        },
    },
    {
        type: "function",
        function: {
            name: "convert_recipe_servings",
            description:
                "Convert the open recipe to a different serving size. Returns every ingredient with its scaled name. Always call this first when the user asks to convert servings, present its items, and when they then ask to add everything, pass those exact item names to add_to_shopping_list.",
            parameters: {
                type: "object",
                properties: {
                    persons: { type: "number", description: "Target number of persons." },
                },
                required: ["persons"],
            },
        },
    },
] as const

export async function executeAiTool(name: string, argsJson: string, context?: ChatContext): Promise<string> {
    // Some providers return arguments pre-parsed as an object instead of a JSON string.
    let args: any = {}

    if (typeof argsJson === "object" && argsJson !== null) {
        args = argsJson
    } else {
        try {
            args = argsJson ? JSON.parse(argsJson) : {}
        } catch {
            return JSON.stringify({ error: "Tool arguments were not valid JSON." })
        }
    }

    try {
        if (name === "add_to_shopping_list") {
            return JSON.stringify(await addToShoppingList(args))
        }

        if (name === "convert_recipe_servings") {
            return JSON.stringify(await convertRecipeServings(args, context))
        }

        return JSON.stringify({ error: `Unknown tool: ${name}` })
    } catch (error) {
        return JSON.stringify({ error: error instanceof Error ? error.message : String(error) })
    }
}
