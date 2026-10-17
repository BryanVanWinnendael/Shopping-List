import { memo, useCallback, useMemo, useState } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { Check, ShoppingBasket } from "lucide-react-native"
import { PressableScale } from "pressto"
import Toast from "react-native-toast-message"
import { useProductsList } from "@/hooks/products-list/useProductsList"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"
import { OnlineRecipeDetails } from "@/types/generated/models/online_recipe_details"

type Props = {
    recipe: OnlineRecipeDetails
}

type RowProps = {
    ingredient: string
    index: number
    added: boolean
    onAdd: (index: number) => void
}

const IngredientRow = memo(function IngredientRow({ ingredient, index, added, onAdd }: RowProps) {
    const { vars } = useThemes()

    return (
        <View
            style={[styles.itemRow, { backgroundColor: vars.backgroundColor, borderColor: vars.secondaryBorderColor }]}
        >
            <View style={styles.itemContent}>
                <Text style={[styles.itemText, { color: vars.textColor }]} numberOfLines={1}>
                    {ingredient}
                </Text>
            </View>

            <PressableScale
                enabled={!added}
                onPress={() => onAdd(index)}
                accessibilityRole="button"
                accessibilityLabel={added ? `${ingredient} added` : `Add ${ingredient}`}
                style={[styles.itemButton, { backgroundColor: added ? `${vars.accentColor}12` : "transparent" }]}
            >
                {added && <Check size={15} strokeWidth={2.5} color={vars.accentColor} />}
                <Text style={[styles.buttonText, { color: vars.accentColor }]}>{added ? "Added" : "Add"}</Text>
            </PressableScale>
        </View>
    )
})

export default function IngredientsList({ recipe }: Props) {
    const { vars } = useThemes()
    const { actions } = useProductsList()

    const [added, setAdded] = useState<Set<number>>(new Set())
    const [loadingAll, setLoadingAll] = useState(false)

    const ingredients = recipe.ingredients ?? []
    const recipeRef = useMemo(() => ({ id: recipe.source, title: recipe.title }), [recipe.source, recipe.title])
    const allAdded = ingredients.length > 0 && added.size === ingredients.length

    const markAdded = (indexes: number[]) => setAdded((prev) => new Set([...prev, ...indexes]))

    const markRemoved = (index: number) =>
        setAdded((prev) => {
            const next = new Set(prev)
            next.delete(index)
            return next
        })

    const addOne = useCallback(
        async (index: number) => {
            const ingredient = ingredients[index]

            if (!ingredient || added.has(index)) return

            // Optimistic update, rolled back if adding fails.
            markAdded([index])

            try {
                await actions.createProduct(ingredient, null, null, null, recipeRef)
            } catch {
                markRemoved(index)
                Toast.show({ type: "error", text1: "Failed to add ingredient" })
            }
        },
        [actions, ingredients, added, recipeRef]
    )

    const addAll = useCallback(async () => {
        if (loadingAll) return

        const pending = ingredients.map((_, index) => index).filter((index) => !added.has(index))

        if (!pending.length) return

        setLoadingAll(true)

        // allSettled, so one failure doesn't hide the ones that did succeed.
        const results = await Promise.allSettled(
            pending.map((index) => actions.createProduct(ingredients[index], null, null, null, recipeRef))
        )
        const succeeded = pending.filter((_, n) => results[n].status === "fulfilled")

        markAdded(succeeded)
        setLoadingAll(false)

        if (succeeded.length === pending.length) {
            Toast.show({ type: "success", text1: "Ingredients added successfully!" })
        } else {
            Toast.show({ type: "error", text1: "Some ingredients couldn't be added" })
        }
    }, [actions, ingredients, added, loadingAll, recipeRef])

    return (
        <View style={[styles.container, { backgroundColor: vars.secondaryBackgroundColor }]}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <View style={[styles.iconWrapper, { backgroundColor: `${vars.accentColor}18` }]}>
                        <ShoppingBasket size={19} strokeWidth={2.2} color={vars.accentColor} />
                    </View>

                    <View style={styles.textBlock}>
                        <Text style={[styles.title, { color: vars.textColor }]}>Ingredients</Text>
                        <Text style={styles.subtitle}>Add ingredients to your shopping list</Text>
                    </View>
                </View>

                <PressableScale
                    onPress={addAll}
                    enabled={!allAdded && !loadingAll}
                    accessibilityRole="button"
                    accessibilityLabel="Add all ingredients"
                    style={[
                        styles.addAllButton,
                        {
                            backgroundColor: allAdded ? `${vars.accentColor}14` : vars.backgroundColor,
                            borderColor: vars.secondaryBorderColor,
                            opacity: loadingAll ? 0.6 : 1,
                        },
                    ]}
                >
                    {loadingAll ? (
                        <ActivityIndicator size="small" color={vars.accentColor} />
                    ) : (
                        <>
                            {allAdded && <Check size={15} strokeWidth={2.5} color={vars.accentColor} />}
                            <Text style={[styles.buttonText, { color: allAdded ? vars.accentColor : vars.textColor }]}>
                                {allAdded ? "Added" : "Add All"}
                            </Text>
                        </>
                    )}
                </PressableScale>
            </View>

            <View style={styles.list}>
                {ingredients.map((ingredient, index) => (
                    <IngredientRow
                        key={`${ingredient}-${index}`}
                        ingredient={ingredient}
                        index={index}
                        added={added.has(index)}
                        onAdd={addOne}
                    />
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BORDER_RADIUS_L,
        padding: 14,
        gap: 12,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    titleContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 11,
        paddingRight: 10,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS_M,
        justifyContent: "center",
        alignItems: "center",
    },
    textBlock: {
        flex: 1,
    },
    title: {
        fontSize: 17,
        fontWeight: "700",
        letterSpacing: -0.2,
    },
    subtitle: {
        marginTop: 2,
        fontSize: 12.5,
        color: "#8E8E93",
    },
    addAllButton: {
        minHeight: 34,
        paddingHorizontal: 12,
        borderRadius: BORDER_RADIUS_M,
        borderWidth: StyleSheet.hairlineWidth,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
    },
    buttonText: {
        fontSize: 13,
        fontWeight: "600",
    },
    list: {
        gap: 7,
    },
    itemRow: {
        minHeight: 58,
        borderRadius: BORDER_RADIUS_M,
        paddingHorizontal: 10,
        paddingVertical: 9,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: StyleSheet.hairlineWidth,
    },
    itemContent: {
        flex: 1,
        justifyContent: "center",
        paddingRight: 8,
    },
    itemText: {
        fontSize: 15,
        fontWeight: "500",
        letterSpacing: -0.1,
    },
    itemButton: {
        minHeight: 32,
        paddingHorizontal: 10,
        borderRadius: BORDER_RADIUS_M,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
})
