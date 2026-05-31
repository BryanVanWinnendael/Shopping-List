import { StyleSheet, Text, View } from "react-native"
import { MEALS } from "@/lib/constants"
import { Recipe } from "@/types/recipes"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    recipe: Recipe
    headerHeight: number
    setOffset: (val: number) => void
}

export default function Header({ recipe, headerHeight, setOffset }: Props) {
    const { vars } = useThemes()

    return (
        <View
            onLayout={(e) => {
                setOffset(e.nativeEvent.layout.height)
            }}
            style={[styles.wrapper, { top: headerHeight + 80 }]}
        >
            <GlassOrBlurView style={styles.card} borderColor={`${vars.secondaryBorderColor}50`}>
                <Text style={[styles.title, { color: vars.textColor }]}>{recipe.title}</Text>

                <View style={styles.chips}>
                    {recipe.mealType && recipe.mealType !== "Any" && (
                        <View
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: vars.backgroundColor,
                                    borderColor: vars.borderColor,
                                },
                            ]}
                        >
                            <Text style={{ color: vars.textColor }}>
                                {MEALS[recipe.mealType]} {recipe.mealType}
                            </Text>
                        </View>
                    )}

                    {recipe.country && (
                        <View
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: vars.backgroundColor,
                                    borderColor: vars.borderColor,
                                },
                            ]}
                        >
                            <Text style={{ color: vars.textColor }}>{recipe.country}</Text>
                        </View>
                    )}

                    {recipe.time != null && recipe.time > 0 && (
                        <View
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: vars.backgroundColor,
                                    borderColor: vars.borderColor,
                                },
                            ]}
                        >
                            <Text style={{ color: vars.textColor }}>⏱ {recipe.time} min</Text>
                        </View>
                    )}

                    {recipe.persons != null && recipe.persons > 0 && (
                        <View
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: vars.backgroundColor,
                                    borderColor: vars.borderColor,
                                },
                            ]}
                        >
                            <Text style={{ color: vars.textColor }}>👥 {recipe.persons} Persons</Text>
                        </View>
                    )}
                </View>
            </GlassOrBlurView>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute",
        left: 10,
        right: 10,
        borderRadius: 0,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
        zIndex: 1,
    },
    card: {
        borderRadius: 28,
        padding: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
    },
    chips: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 8,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 25,
        borderWidth: 1,
    },
})
