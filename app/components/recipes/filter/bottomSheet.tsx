import { BlurView } from "expo-blur"
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { RefObject, useRef } from "react"
import { useRecipesStore } from "@/stores/useRecipesStore"
import MealTypeSegment from "@/components/recipes/mealTypeSegment"
import Field from "@/components/recipes/filter/field"
import CountriesFilter from "@/components/recipes/filter/countriesFilter"
import useThemes from "@/hooks/themes/useThemes"
import CustomSwitch from "@/components/customSwitch"
import { MealType } from "@/types/generated/models/meal_type"
import AppBottomSheet, { BottomSheetRef } from "@/components/native/bottom-sheet/appBottomSheet"
import { PressableScale } from "pressto"
import { BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

type Props = {
    sheetRef: RefObject<BottomSheetRef | null>
    onClose: () => void
}

export default function BottomSheet({ sheetRef, onClose }: Props) {
    const { vars, theme, appearance } = useThemes()

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
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={0}
            >
                <View style={styles.inner}>
                    <View style={styles.header}>
                        <BlurView intensity={10} tint={appearance} style={styles.blur}>
                            <Text style={[styles.headerTitle, { color: vars.textColor }]}>Filter Recipes</Text>
                        </BlurView>
                    </View>

                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="interactive"
                    >
                        <View style={styles.fields}>
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
                                <View style={styles.switchRow}>
                                    <View style={styles.switchTextBlock}>
                                        <Text style={[styles.switchTitle, { color: vars.textColor }]}>Public</Text>

                                        <Text style={[styles.switchSubtitle, { color: vars.tertiaryTextColor }]}>
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
                                <View style={styles.switchRow}>
                                    <View style={styles.switchTextBlock}>
                                        <Text style={[styles.switchTitle, { color: vars.textColor }]}>Saved</Text>

                                        <Text
                                            style={[
                                                styles.switchSubtitle,
                                                { color: theme === "light" ? "#6b7280" : "#8b9199" },
                                            ]}
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
                                        keyboardAppearance={appearance}
                                        style={[
                                            styles.timeInput,
                                            {
                                                borderColor: vars.borderColor,
                                                backgroundColor: vars.secondaryBackgroundColor,
                                                color: vars.textColor,
                                            },
                                        ]}
                                    />
                                </Field>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
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
                            accessibilityRole="button"
                            accessibilityLabel="Clear filters"
                            style={[styles.clearButton, { backgroundColor: vars.secondaryBorderColor }]}
                        >
                            <Text style={[styles.clearText, { color: vars.textColor }]}>Clear Filters</Text>
                        </PressableScale>

                        <PressableScale
                            onPress={onClose}
                            accessibilityRole="button"
                            accessibilityLabel="Show results"
                            style={[styles.applyButton, { backgroundColor: vars.accentColor }]}
                        >
                            <Text style={styles.applyText}>Show results</Text>
                        </PressableScale>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </AppBottomSheet>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inner: {
        flex: 1,
    },
    header: {
        position: "absolute",
        top: -40,
        left: 0,
        right: 0,
        height: 88,
        zIndex: 10,
        overflow: "hidden",
    },
    blur: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 64,
        paddingBottom: 100,
    },
    fields: {
        gap: 22,
    },
    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    switchTextBlock: {
        flex: 1,
        paddingRight: 16,
    },
    switchTitle: {
        fontSize: 16,
        fontWeight: "600",
    },
    switchSubtitle: {
        marginTop: 3,
        fontSize: 13,
        lineHeight: 18,
    },
    timeInput: {
        borderWidth: 1,
        borderRadius: BORDER_RADIUS_M,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
    },
    footer: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: "transparent",
    },
    clearButton: {
        minHeight: 54,
        borderRadius: BORDER_RADIUS_L,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    clearText: {
        fontWeight: "600",
        fontSize: 16,
    },
    applyButton: {
        flex: 1,
        minHeight: 54,
        borderRadius: BORDER_RADIUS_L,
        alignItems: "center",
        justifyContent: "center",
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 5,
    },
    applyText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
})
