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
    args: { persons?: number; items?: string[]; fromPersons?: number },
    context?: { type?: string; recipe?: unknown; onlineRecipe?: unknown }
) {
    const target = typeof args.persons === "number" && args.persons > 0 ? Math.round(args.persons) : null

    if (!target) {
        return { error: "Missing a valid persons count." }
    }

    // Products the user names directly, which have no recipe to scale from.
    const explicitItems = (Array.isArray(args.items) ? args.items : [])
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)

    const type = context?.type
    let title = ""
    let basePersons: number | null = null
    let names: string[] = []

    if (explicitItems.length > 0) {
        basePersons = typeof args.fromPersons === "number" && args.fromPersons > 0 ? args.fromPersons : null
        names = explicitItems
    } else if (type === "recipe" && context?.recipe) {
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
        return {
            error: "No recipe is open. If the user named products, pass them in items together with the serving size they are for.",
        }
    }

    if (!basePersons || basePersons <= 0) {
        return {
            error:
                explicitItems.length > 0
                    ? "The items have no serving size attached. Ask the user how many persons the stated amount is for."
                    : "The recipe has no serving size stored, so ask the user what it currently serves.",
        }
    }

    const factor = target / basePersons
    const result = {
        fromPersons: basePersons,
        toPersons: target,
        factor: Math.round(factor * 100) / 100,
        items: names.map((name) => ({ name: scaleIngredientName(name, factor) })),
    }

    return title ? { title, ...result } : result
}

async function addToShoppingList(args: {
    items?: { name?: string; category?: string }[]
    product?: string
    category?: string
    recipe?: { id?: string; title?: string } | null
    recipeId?: string
    recipeTitle?: string
    fromPersons?: number
    toPersons?: number
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

    // Only scale when the user gave both the serving size the amounts are for
    // and the size to convert to. A plain "add 5 apples" stays "5 apples".
    const factor =
        typeof args.fromPersons === "number" &&
        typeof args.toPersons === "number" &&
        args.fromPersons > 0 &&
        args.toPersons > 0
            ? args.toPersons / args.fromPersons
            : null

    const added: string[] = []
    const failed: string[] = []

    for (const item of items) {
        const raw = item.name!.trim().replace(/\.$/, "")
        const name = factor !== null ? scaleIngredientName(raw, factor) : raw

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
                "Add one or more products to the shopping list. The user can name products that are not on the list yet; add them exactly as given. When the items come from a recipe page, pass that recipe so the items group under it. When the user states the serving size their amounts are for and a different size to convert to, pass fromPersons and toPersons and the tool scales every amount.",
            parameters: {
                type: "object",
                properties: {
                    items: {
                        type: "array",
                        description: "Products to add.",
                        items: {
                            type: "object",
                            properties: {
                                name: {
                                    type: "string",
                                    description: "Product name, as the user typed it or as it appears in the context.",
                                },
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
                    fromPersons: {
                        type: "number",
                        description:
                            "The serving size the given amounts are for. Only pass this when the user states it.",
                    },
                    toPersons: {
                        type: "number",
                        description: "The serving size to convert the amounts to. Only pass this with fromPersons.",
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
                "Convert the open recipe, or products the user names, to a different serving size. Returns every item with its scaled name. Use it when the user wants to see the converted amounts before adding. For products that are not from a recipe, pass items and fromPersons. Always call this first when the user asks to convert servings, present its items, and when they then ask to add everything, pass those exact item names to add_to_shopping_list.",
            parameters: {
                type: "object",
                properties: {
                    persons: { type: "number", description: "Target number of persons." },
                    items: {
                        type: "array",
                        description: 'Products to convert when they are not from a recipe, e.g. ["5 apples"].',
                        items: { type: "string" },
                    },
                    fromPersons: {
                        type: "number",
                        description: "The serving size the items are currently for. Required when items are given.",
                    },
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
