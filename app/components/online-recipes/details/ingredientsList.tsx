import { useCallback, useMemo, useState } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { Check, ShoppingBasket } from "lucide-react-native"
import { PressableScale } from "pressto"
import { useProductsList } from "@/hooks/products-list/useProductsList"
import useThemes from "@/hooks/themes/useThemes"
import Toast from "react-native-toast-message"
import { OnlineRecipeDetails } from "@/types/generated/models/online_recipe_details"
import { BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

type Props = {
    recipe: OnlineRecipeDetails
}

export default function IngredientsList({ recipe }: Props) {
    const { vars } = useThemes()
    const { actions } = useProductsList()

    const [selected, setSelected] = useState<number[]>([])
    const [loadingAll, setLoadingAll] = useState(false)

    const ingredients = recipe?.ingredients ?? []
    const selectedSet = useMemo(() => new Set(selected), [selected])

    const allAdded = ingredients.length > 0 && selected.length === ingredients.length

    const addSelectedItem = useCallback(
        async (index: number) => {
            if (selectedSet.has(index)) return

            const ingredient = ingredients[index]
            if (!ingredient) return

            // Optimistic update
            setSelected((prev) => (prev.includes(index) ? prev : [...prev, index]))

            try {
                await actions.createProduct(ingredient)
            } catch (e) {
                // Roll back if adding fails
                setSelected((prev) => prev.filter((i) => i !== index))
            }
        },
        [actions, ingredients, selectedSet]
    )

    const addAll = useCallback(async () => {
        if (!ingredients.length || loadingAll) return

        const indexesToAdd = ingredients.map((_, index) => index).filter((index) => !selectedSet.has(index))

        if (!indexesToAdd.length) return

        Toast.show({
            type: "success",
            text1: "Adding all ingredients...",
        })

        setLoadingAll(true)

        try {
            await Promise.all(indexesToAdd.map((index) => actions.createProduct(ingredients[index])))

            setSelected((prev) => [...new Set([...prev, ...indexesToAdd])])
        } catch (e) {
            console.log(e)
        } finally {
            setLoadingAll(false)

            Toast.show({
                type: "success",
                text1: "Ingredients added successfully!",
            })
        }
    }, [actions, ingredients, loadingAll, selectedSet])

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: vars.secondaryBackgroundColor,
                },
            ]}
        >
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <View
                        style={[
                            styles.iconWrapper,
                            {
                                backgroundColor: `${vars.accentColor}18`,
                            },
                        ]}
                    >
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
                    style={[
                        styles.addAllButton,
                        {
                            backgroundColor: allAdded ? `${vars.accentColor}14` : vars.backgroundColor,
                            borderColor: vars.borderColor,
                            opacity: loadingAll ? 0.6 : 1,
                        },
                    ]}
                >
                    {loadingAll ? (
                        <ActivityIndicator size="small" color={vars.accentColor} />
                    ) : allAdded ? (
                        <>
                            <Check size={15} strokeWidth={2.5} color={vars.accentColor} />

                            <Text style={[styles.addAllText, { color: vars.accentColor }]}>Added</Text>
                        </>
                    ) : (
                        <Text style={[styles.addAllText, { color: vars.textColor }]}>Add All</Text>
                    )}
                </PressableScale>
            </View>

            <View style={styles.list}>
                {ingredients.map((ingredient, index) => {
                    const isSelected = selectedSet.has(index)

                    return (
                        <View
                            key={`${ingredient}-${index}`}
                            style={[
                                styles.itemRow,
                                {
                                    backgroundColor: vars.backgroundColor,
                                    borderColor: vars.secondaryBorderColor,
                                },
                            ]}
                        >
                            <View style={styles.itemContent}>
                                <Text style={[styles.itemText, { color: vars.textColor }]} numberOfLines={1}>
                                    {ingredient}
                                </Text>
                            </View>

                            <PressableScale
                                enabled={!isSelected}
                                onPress={() => addSelectedItem(index)}
                                style={[
                                    styles.itemButton,
                                    {
                                        backgroundColor: isSelected ? `${vars.accentColor}12` : "transparent",
                                    },
                                ]}
                            >
                                {isSelected ? (
                                    <>
                                        <Check size={15} strokeWidth={2.5} color={vars.accentColor} />

                                        <Text
                                            style={[
                                                styles.itemButtonText,
                                                {
                                                    color: vars.accentColor,
                                                },
                                            ]}
                                        >
                                            Added
                                        </Text>
                                    </>
                                ) : (
                                    <Text
                                        style={[
                                            styles.itemButtonText,
                                            {
                                                color: vars.accentColor,
                                            },
                                        ]}
                                    >
                                        Add
                                    </Text>
                                )}
                            </PressableScale>
                        </View>
                    )
                })}
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
    addAllText: {
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
    itemButtonText: {
        fontSize: 13,
        fontWeight: "600",
    },
})
