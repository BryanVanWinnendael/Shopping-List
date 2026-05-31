import { KeyboardAvoidingView, Platform, Text, TextInput, View } from "react-native"
import { useRecipesStore } from "@/stores/useRecipesStore"
import { PressableScale } from "pressto"
import { MealType } from "@/types/recipes"
import { RefObject } from "react"
import GorhomBottomSheet from "@gorhom/bottom-sheet"
import MealTypeSegment from "@/components/recipes/mealTypeSegment"
import CustomBottomSheet from "@/components/customBottomSheet"
import Field from "@/components/recipes/filter/field"
import CountriesFilter from "@/components/recipes/filter/countriesFilter"
import useThemes from "@/hooks/themes/useThemes"
import CustomSwitch from "@/components/customSwitch"

type Props = {
    sheetRef: RefObject<GorhomBottomSheet | null>
    onClose: () => void
}

export default function BottomSheet({ sheetRef, onClose }: Props) {
    const { vars, theme } = useThemes()
    const { activeFilter, updateFilter, setActiveFilter } = useRecipesStore()

    const snapPoints = ["30%"]

    return (
        <CustomBottomSheet sheetRef={sheetRef} onClose={onClose} snapPoints={snapPoints}>
            <View>
                <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 16, color: vars.textColor }}>
                    Filter Recipes
                </Text>

                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
                    <Field label="Meal Type">
                        <MealTypeSegment
                            value={activeFilter.mealType}
                            onChange={(v: MealType) => updateFilter({ mealType: v })}
                        />
                    </Field>

                    <Field label="Public">
                        <CustomSwitch value={activeFilter.public} onChange={(v) => updateFilter({ public: v })} />
                    </Field>

                    <Field label="Country">
                        <CountriesFilter />
                    </Field>

                    <Field label="Max Time">
                        <TextInput
                            returnKeyType="done"
                            placeholder="e.g. 30"
                            placeholderTextColor="#aaa"
                            keyboardType="numeric"
                            value={activeFilter.time?.toString() || ""}
                            onChangeText={(v) => updateFilter({ time: v ? parseInt(v, 10) : null })}
                            keyboardAppearance={theme === "light" ? "light" : "dark"}
                            style={{
                                borderWidth: 1,
                                borderColor: vars.secondaryBorderColor,
                                borderRadius: 14,
                                padding: 12,
                                backgroundColor: vars.secondaryBackgroundColor,
                                color: vars.textColor,
                            }}
                        />
                    </Field>

                    <PressableScale
                        style={{
                            backgroundColor: vars.accentColor,
                            padding: 14,
                            borderRadius: 24,
                            alignItems: "center",
                            marginTop: 16,
                        }}
                        onPress={() =>
                            setActiveFilter({
                                mealType: "Any",
                                public: true,
                                country: "Any",
                                time: null,
                            })
                        }
                    >
                        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Clear</Text>
                    </PressableScale>
                </KeyboardAvoidingView>
            </View>
        </CustomBottomSheet>
    )
}
