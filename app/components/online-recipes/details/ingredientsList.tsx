import { useCallback, useMemo, useState } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { Check, ShoppingBasket } from "lucide-react-native"
import { PressableScale } from "pressto"
import { OnlineRecipe } from "@/types/recipes"
import { useProductsList } from "@/hooks/products-list/useProductsList"
import useThemes from "@/hooks/themes/useThemes"
import Toast from "react-native-toast-message"

type Props = {
    recipe: OnlineRecipe
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

            const product = ingredients[index]
            if (!product) return

            setSelected((prev) => [...prev, index])

            try {
                await actions.createProduct(product)
            } catch (e) {
                setSelected((prev) => prev.filter((i) => i !== index))
            }
        },
        [actions, ingredients, selectedSet]
    )

    const addAll = useCallback(async () => {
        if (!ingredients.length || loadingAll) return

        Toast.show({
            type: "success",
            text1: "Adding all ingredients...",
        })

        setLoadingAll(true)

        try {
            const indexesToAdd = ingredients.map((_, index) => index).filter((index) => !selectedSet.has(index))

            await Promise.all(
                indexesToAdd.map(async (index) => {
                    await actions.createProduct(ingredients[index])
                })
            )

            setSelected((prev) => [...new Set([...prev, ...indexesToAdd])])
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
                    borderColor: vars.secondaryBorderColor,
                },
            ]}
        >
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <View style={[styles.iconWrapper, { backgroundColor: `${vars.accentColor}20` }]}>
                        <ShoppingBasket size={18} color={vars.accentColor} />
                    </View>

                    <View style={styles.textBlock}>
                        <Text style={[styles.title, { color: vars.textColor }]}>Ingredients</Text>

                        <Text style={[styles.subtitle]}>Add ingredients directly to the list</Text>
                    </View>
                </View>

                <PressableScale
                    onPress={addAll}
                    enabled={!allAdded && !loadingAll}
                    style={[
                        styles.addAllButton,
                        {
                            backgroundColor: allAdded ? "rgba(52,199,89,0.15)" : vars.backgroundColor,
                            borderColor: vars.borderColor,
                            opacity: loadingAll ? 0.7 : 1,
                        },
                    ]}
                >
                    {allAdded && <Check size={16} color="#34C759" style={{ marginRight: 6 }} />}

                    {loadingAll ? (
                        <ActivityIndicator size="small" color={vars.textColor} />
                    ) : (
                        <Text
                            style={{
                                color: allAdded ? "#34C759" : vars.textColor,
                                fontWeight: "600",
                                fontSize: 14,
                            }}
                        >
                            {allAdded ? "Added All" : "Add All"}
                        </Text>
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
                                        backgroundColor: isSelected
                                            ? "rgba(52,199,89,0.15)"
                                            : vars.secondaryBackgroundColor,
                                        borderColor: vars.borderColor,
                                    },
                                ]}
                            >
                                {isSelected && <Check size={14} color="#34C759" style={{ marginRight: 4 }} />}

                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontWeight: "600",
                                        color: isSelected ? "#34C759" : vars.textColor,
                                        textDecorationLine: isSelected ? "underline" : "none",
                                    }}
                                >
                                    {isSelected ? "Added" : "Add"}
                                </Text>
                            </PressableScale>
                        </View>
                    )
                })}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    textBlock: {
        flex: 1,
        paddingRight: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        flexWrap: "wrap",
    },
    subtitle: {
        fontSize: 13,
        marginTop: 2,
        flexWrap: "wrap",
        color: "#9ca3af",
    },
    container: {
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        gap: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 12,
        paddingRight: 10,
    },
    iconWrapper: {
        width: 42,
        height: 42,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
    },
    addAllButton: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderWidth: 1,
    },
    list: {
        gap: 10,
        marginTop: 6,
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        borderRadius: 18,
        borderWidth: 1,
    },
    itemContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    itemText: {
        fontSize: 15,
        fontWeight: "500",
        flex: 1,
    },
    itemButton: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 999,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderWidth: 1,
    },
})
