import { useRef, useState } from "react"
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import { BlurView } from "expo-blur"
import { Check, ChevronDown, ChevronUp, ListFilter, Search } from "lucide-react-native"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { PressableScale } from "pressto"
import AppBottomSheet, { BottomSheetRef } from "@/components/native/bottom-sheet/appBottomSheet"
import LiquidGlassView from "@/components/native/liquidGlassView"
import useThemes from "@/hooks/themes/useThemes"
import { COURSES, DISHES, KITCHENS, SPECIALS } from "@/lib/constants"
import {
    BORDER_RADIUS_FULL,
    BORDER_RADIUS_L,
    BORDER_RADIUS_M,
    DOCK_BOTTOM,
    DOCK_GAP,
    DOCK_SIDE,
    FAB_ICON_SIZE,
    FAB_SIZE,
    SHEET_CTA_HEIGHT,
} from "@/lib/theme"
import { OnlineRecipeFilter } from "@/types/generated/models/online_recipe_filter"

type FilterGroup = keyof OnlineRecipeFilter

type Option = { value: string; label: string }

// Order here is the order the groups stack in the sheet.
const GROUPS: { key: FilterGroup; label: string; options: Option[] }[] = [
    { key: "kitchens", label: "Kitchen", options: KITCHENS },
    { key: "courses", label: "Course", options: COURSES },
    { key: "dishes", label: "Dish", options: DISHES },
    { key: "specials", label: "Dietary", options: SPECIALS },
]

const EMPTY_FILTER: OnlineRecipeFilter = { kitchens: [], courses: [], dishes: [], specials: [] }

const countAll = (filter: OnlineRecipeFilter) => GROUPS.reduce((total, group) => total + filter[group.key].length, 0)

// Selection order carries no meaning, so compare as sets: re-picking the same
// values in a different order should not trigger a reload.
const isDifferent = (a: OnlineRecipeFilter, b: OnlineRecipeFilter) =>
    GROUPS.some((group) => {
        const left = a[group.key]
        const right = b[group.key]

        return left.length !== right.length || left.some((value) => !right.includes(value))
    })

const summarise = (group: (typeof GROUPS)[number], selected: string[]) => {
    if (!selected.length) return "Any"
    if (selected.length === 1) return group.options.find((option) => option.value === selected[0])?.label ?? "Any"

    return `${selected.length} selected`
}

type Props = {
    filter: OnlineRecipeFilter
    onApply: (filter: OnlineRecipeFilter) => void
}

export default function OnlineRecipeFilters({ filter, onApply }: Props) {
    const { vars, appearance } = useThemes()
    const sheetRef = useRef<BottomSheetRef>(null)

    // Selections are staged here and applied once on close, so tapping through
    // the list costs one request instead of one per chip.
    const [draft, setDraft] = useState(filter)
    const draftRef = useRef(draft)

    // One group at a time: the dish list alone is 40 rows.
    const [openGroup, setOpenGroup] = useState<FilterGroup | null>(null)
    const [search, setSearch] = useState("")

    const appliedCount = countAll(filter)
    const draftCount = countAll(draft)

    const open = () => {
        // Re-sync so the sheet always opens on what is actually applied.
        draftRef.current = filter
        setDraft(filter)
        setOpenGroup(null)
        setSearch("")

        sheetRef.current?.expand()
    }

    const update = (next: OnlineRecipeFilter) => {
        draftRef.current = next
        setDraft(next)
    }

    const toggle = (group: FilterGroup, value: string) => {
        const current = draftRef.current[group]

        update({
            ...draftRef.current,
            [group]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
        })
    }

    const toggleGroup = (key: FilterGroup) => {
        setSearch("")
        setOpenGroup((prev) => (prev === key ? null : key))
    }

    // Runs for the pan-down gesture and the backdrop too, so every way out of
    // the sheet applies whatever is staged.
    const handleClose = () => {
        setOpenGroup(null)
        setSearch("")

        if (isDifferent(draftRef.current, filter)) {
            onApply(draftRef.current)
        }
    }

    return (
        <>
            <View style={styles.buttonWrapper}>
                <LiquidGlassView style={styles.button} isInteractive>
                    <PressableScale
                        onPress={open}
                        accessibilityRole="button"
                        accessibilityLabel={appliedCount ? `Filter recipes, ${appliedCount} active` : "Filter recipes"}
                        style={styles.pressable}
                    >
                        <ListFilter size={FAB_ICON_SIZE} strokeWidth={2} color={vars.textColor} />
                    </PressableScale>

                    {appliedCount > 0 && (
                        <Animated.View
                            entering={FadeIn.duration(120)}
                            exiting={FadeOut.duration(120)}
                            style={[styles.badge, { backgroundColor: vars.accentColor }]}
                        >
                            <Text style={styles.badgeText}>{appliedCount}</Text>
                        </Animated.View>
                    )}
                </LiquidGlassView>
            </View>

            <AppBottomSheet
                ref={sheetRef}
                index={-1}
                snapPoints={["50%", "80%"]}
                enablePanDownToClose
                onClose={handleClose}
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

                                <Text style={[styles.headerCount, { color: vars.secondaryTextColor }]}>
                                    {draftCount ? `${draftCount} selected` : "No filters selected"}
                                </Text>
                            </BlurView>
                        </View>

                        <ScrollView
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="interactive"
                        >
                            {GROUPS.map((group) => {
                                const selected = draft[group.key]
                                const expanded = openGroup === group.key

                                const query = search.trim().toLowerCase()
                                const visible = query
                                    ? group.options.filter((option) => option.label.toLowerCase().includes(query))
                                    : group.options

                                return (
                                    <View
                                        key={group.key}
                                        style={[styles.group, { backgroundColor: vars.secondaryBackgroundColor }]}
                                    >
                                        <PressableScale
                                            onPress={() => toggleGroup(group.key)}
                                            accessibilityRole="button"
                                            accessibilityState={{ expanded }}
                                            accessibilityLabel={`${group.label}, ${summarise(group, selected)}`}
                                            style={styles.groupHeader}
                                        >
                                            <Text style={[styles.groupLabel, { color: vars.textColor }]}>
                                                {group.label}
                                            </Text>

                                            <View style={styles.groupRight}>
                                                <Text
                                                    style={[
                                                        styles.groupSummary,
                                                        {
                                                            color: selected.length
                                                                ? vars.accentColor
                                                                : vars.secondaryTextColor,
                                                        },
                                                    ]}
                                                    numberOfLines={1}
                                                >
                                                    {summarise(group, selected)}
                                                </Text>

                                                {expanded ? (
                                                    <ChevronUp size={18} color={vars.secondaryTextColor} />
                                                ) : (
                                                    <ChevronDown size={18} color={vars.secondaryTextColor} />
                                                )}
                                            </View>
                                        </PressableScale>

                                        {expanded && (
                                            <View style={styles.panel}>
                                                <View
                                                    style={[
                                                        styles.searchRow,
                                                        { borderColor: vars.secondaryBorderColor },
                                                    ]}
                                                >
                                                    <Search size={16} color={vars.secondaryTextColor} />

                                                    <TextInput
                                                        value={search}
                                                        onChangeText={setSearch}
                                                        placeholder={`Search ${group.label.toLowerCase()}...`}
                                                        placeholderTextColor={vars.secondaryTextColor}
                                                        autoCorrect={false}
                                                        autoCapitalize="none"
                                                        returnKeyType="search"
                                                        keyboardAppearance={appearance}
                                                        style={[styles.searchInput, { color: vars.textColor }]}
                                                    />
                                                </View>

                                                {visible.map((option) => {
                                                    const isSelected = selected.includes(option.value)

                                                    return (
                                                        <PressableScale
                                                            key={option.value}
                                                            onPress={() => toggle(group.key, option.value)}
                                                            accessibilityRole="checkbox"
                                                            accessibilityState={{ checked: isSelected }}
                                                            accessibilityLabel={option.label}
                                                            style={styles.optionRow}
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.optionText,
                                                                    {
                                                                        color: isSelected
                                                                            ? vars.accentColor
                                                                            : vars.textColor,
                                                                    },
                                                                ]}
                                                            >
                                                                {option.label}
                                                            </Text>

                                                            <View
                                                                style={[
                                                                    styles.checkCircle,
                                                                    {
                                                                        borderColor: isSelected
                                                                            ? vars.accentColor
                                                                            : vars.secondaryBorderColor,
                                                                        backgroundColor: isSelected
                                                                            ? vars.accentColor
                                                                            : "transparent",
                                                                    },
                                                                ]}
                                                            >
                                                                {isSelected && (
                                                                    <Check size={13} color="#fff" strokeWidth={3} />
                                                                )}
                                                            </View>
                                                        </PressableScale>
                                                    )
                                                })}

                                                {!visible.length && (
                                                    <Text style={[styles.empty, { color: vars.secondaryTextColor }]}>
                                                        No matches
                                                    </Text>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                )
                            })}
                        </ScrollView>

                        <View style={styles.footer}>
                            <PressableScale
                                onPress={() => update(EMPTY_FILTER)}
                                enabled={draftCount > 0}
                                accessibilityRole="button"
                                accessibilityLabel="Clear all filters"
                                accessibilityState={{ disabled: draftCount === 0 }}
                                style={[
                                    styles.clearButton,
                                    {
                                        backgroundColor: vars.secondaryBackgroundColor,
                                        opacity: draftCount ? 1 : 0.4,
                                    },
                                ]}
                            >
                                <Text style={[styles.clearText, { color: vars.textColor }]}>Clear Filters</Text>
                            </PressableScale>

                            <PressableScale
                                onPress={() => sheetRef.current?.close()}
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
        </>
    )
}

const styles = StyleSheet.create({
    buttonWrapper: {
        position: "absolute",
        bottom: DOCK_BOTTOM + FAB_SIZE + DOCK_GAP,
        right: DOCK_SIDE,
        zIndex: 1,
    },
    button: {
        width: FAB_SIZE,
        height: FAB_SIZE,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        overflow: "visible",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
    },
    pressable: {
        alignItems: "center",
        justifyContent: "center",
        width: FAB_SIZE,
        height: FAB_SIZE,
    },
    badge: {
        position: "absolute",
        top: -4,
        right: -4,
        minWidth: 20,
        height: 20,
        borderRadius: BORDER_RADIUS_FULL,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 5,
    },
    badgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "700",
    },
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
        height: 100,
        zIndex: 10,
        overflow: "hidden",
    },
    blur: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 46,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "700",
    },
    headerCount: {
        marginTop: 2,
        fontSize: 13,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 72,
        paddingBottom: 100,
    },
    group: {
        marginBottom: 10,
        borderRadius: BORDER_RADIUS_L,
        overflow: "hidden",
    },
    groupHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 54,
        paddingHorizontal: 16,
    },
    groupLabel: {
        fontSize: 16,
        fontWeight: "600",
    },
    groupRight: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        flexShrink: 1,
        marginLeft: 12,
    },
    groupSummary: {
        fontSize: 15,
        flexShrink: 1,
    },
    panel: {
        paddingBottom: 6,
    },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginHorizontal: 12,
        marginTop: 2,
        borderRadius: BORDER_RADIUS_M,
        borderWidth: 1,
        paddingHorizontal: 12,
        height: 42,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        padding: 0,
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 46,
        paddingHorizontal: 16,
    },
    optionText: {
        fontSize: 15,
        flexShrink: 1,
        marginRight: 12,
    },
    checkCircle: {
        width: 22,
        height: 22,
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1.5,
        alignItems: "center",
        justifyContent: "center",
    },
    empty: {
        fontSize: 14,
        paddingVertical: 16,
        textAlign: "center",
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
        height: SHEET_CTA_HEIGHT,
        borderRadius: BORDER_RADIUS_L,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 22,
    },
    clearText: {
        fontWeight: "600",
        fontSize: 16,
    },
    applyButton: {
        flex: 1,
        height: SHEET_CTA_HEIGHT,
        borderRadius: BORDER_RADIUS_L,
        alignItems: "center",
        justifyContent: "center",
    },
    applyText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
})
