import { BlurView } from "expo-blur"
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from "react-native"
import { RefObject, useRef } from "react"

import { useRecipesStore } from "@/stores/useRecipesStore"
import MealTypeSegment from "@/components/recipes/mealTypeSegment"
import Field from "@/components/recipes/filter/field"
import CountriesFilter from "@/components/recipes/filter/countriesFilter"
import useThemes from "@/hooks/themes/useThemes"
import CustomSwitch from "@/components/customSwitch"
import { MealType } from "@/types/generated/models/meal_type"
import AppBottomSheet, { BottomSheetRef } from "@/components/native/appBottomSheet"
import { PressableScale } from "pressto"
import { BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

type Props = {
    sheetRef: RefObject<BottomSheetRef | null>
    onClose: () => void
}

export default function BottomSheet({ sheetRef, onClose }: Props) {
    const { vars, theme } = useThemes()

    const { activeFilter, updateFilter, setActiveFilter } = useRecipesStore()

    const scrollViewRef = useRef<ScrollView>(null)
    const maxTimeY = useRef(0)

    const handleMaxTimeFocus = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({
                y: Math.max(0, maxTimeY.current - 90),
                animated: true,
            })
        }, 100)
    }

    return (
        <AppBottomSheet
            ref={sheetRef}
            index={-1}
            snapPoints={["55%", "70%"]}
            enablePanDownToClose
            onClose={onClose}
            backgroundMode="adaptive"
            backgroundColor={vars.backgroundColor}
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={0}
            >
                <View style={{ flex: 1 }}>
                    <View
                        style={{
                            position: "absolute",
                            top: -40,
                            left: 0,
                            right: 0,
                            height: 88,
                            zIndex: 10,
                            overflow: "hidden",
                        }}
                    >
                        <BlurView
                            intensity={10}
                            tint={theme === "light" ? "light" : "dark"}
                            style={{
                                flex: 1,
                                paddingHorizontal: 20,
                                paddingTop: 48,
                                paddingBottom: 10,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 22,
                                    fontWeight: "700",
                                    color: vars.textColor,
                                }}
                            >
                                Filter Recipes
                            </Text>
                        </BlurView>
                    </View>

                    <ScrollView
                        ref={scrollViewRef}
                        style={{ flex: 1 }}
                        contentContainerStyle={{
                            paddingHorizontal: 20,
                            paddingTop: 64,
                            paddingBottom: 100,
                        }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="interactive"
                    >
                        <View style={{ gap: 22 }}>
                            <Field label="Meal Type">
                                <MealTypeSegment
                                    value={activeFilter.mealType}
                                    onChange={(v: MealType) =>
                                        updateFilter({
                                            mealType: v,
                                        })
                                    }
                                />
                            </Field>

                            <View>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <View
                                        style={{
                                            flex: 1,
                                            paddingRight: 16,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontWeight: "600",
                                                color: vars.textColor,
                                            }}
                                        >
                                            Public
                                        </Text>

                                        <Text
                                            style={{
                                                marginTop: 3,
                                                fontSize: 13,
                                                lineHeight: 18,
                                                color: theme === "light" ? "#6b7280" : "#8b9199",
                                            }}
                                        >
                                            Turn off to show only private recipes. When enabled, all recipes will be
                                            shown.
                                        </Text>
                                    </View>

                                    <CustomSwitch
                                        value={activeFilter.public}
                                        onChange={(v) =>
                                            updateFilter({
                                                public: v,
                                            })
                                        }
                                    />
                                </View>
                            </View>

                            <View>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <View
                                        style={{
                                            flex: 1,
                                            paddingRight: 16,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 16,
                                                fontWeight: "600",
                                                color: vars.textColor,
                                            }}
                                        >
                                            Saved
                                        </Text>

                                        <Text
                                            style={{
                                                marginTop: 3,
                                                fontSize: 13,
                                                lineHeight: 18,
                                                color: theme === "light" ? "#6b7280" : "#8b9199",
                                            }}
                                        >
                                            Only show recipes you saved from the online recipe section.
                                        </Text>
                                    </View>

                                    <CustomSwitch
                                        value={activeFilter.isSaved ?? false}
                                        onChange={(v) =>
                                            updateFilter({
                                                isSaved: v,
                                            })
                                        }
                                    />
                                </View>
                            </View>

                            <Field label="Country">
                                <CountriesFilter />
                            </Field>

                            <View
                                onLayout={(event) => {
                                    maxTimeY.current = event.nativeEvent.layout.y
                                }}
                            >
                                <Field label="Max Time">
                                    <TextInput
                                        returnKeyType="done"
                                        placeholder="e.g. 30"
                                        placeholderTextColor="#aaa"
                                        keyboardType="numeric"
                                        value={activeFilter.time?.toString() || ""}
                                        onFocus={handleMaxTimeFocus}
                                        onChangeText={(v) =>
                                            updateFilter({
                                                time: v ? parseInt(v, 10) : null,
                                            })
                                        }
                                        keyboardAppearance={theme === "light" ? "light" : "dark"}
                                        style={{
                                            borderWidth: 1,
                                            borderColor: vars.secondaryBorderColor,
                                            borderRadius: BORDER_RADIUS_M,
                                            paddingHorizontal: 14,
                                            paddingVertical: 12,
                                            backgroundColor: vars.secondaryBackgroundColor,
                                            color: vars.textColor,
                                            fontSize: 16,
                                        }}
                                    />
                                </Field>
                            </View>
                        </View>
                    </ScrollView>

                    {/* Floating Clear button */}
                    <View
                        style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            paddingHorizontal: 20,
                            paddingTop: 10,
                            paddingBottom: 10,
                            backgroundColor: "transparent",
                        }}
                    >
                        <PressableScale
                            onPress={() =>
                                setActiveFilter({
                                    mealType: "Any",
                                    public: true,
                                    isSaved: false,
                                    country: "Any",
                                    time: null,
                                })
                            }
                            style={{
                                minHeight: 54,
                                borderRadius: BORDER_RADIUS_L,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: vars.accentColor,
                                shadowOffset: {
                                    width: 0,
                                    height: 5,
                                },
                                shadowOpacity: 0.18,
                                shadowRadius: 10,
                                elevation: 5,
                            }}
                        >
                            <Text
                                style={{
                                    color: "#fff",
                                    fontWeight: "700",
                                    fontSize: 16,
                                }}
                            >
                                Clear Filters
                            </Text>
                        </PressableScale>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </AppBottomSheet>
    )
}
