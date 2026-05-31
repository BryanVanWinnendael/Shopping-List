import { StyleSheet, Text, View } from "react-native"
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler"
import * as Haptics from "expo-haptics"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { PressableScale } from "pressto"
import { scheduleOnRN } from "react-native-worklets"
import { Product as ProductType } from "@/types/list"
import CategoryIcon from "@/components/categoryIcon"
import { useProductsList } from "@/hooks/products-list/useProductsList"
import useThemes from "@/hooks/themes/useThemes"
import { Pencil, Trash } from "lucide-react-native"
import CustomImage from "@/components/customImage"
import { Category } from "@/types/category-model"

const SWIPE_DISTANCE = -140
const SWIPE_THRESHOLD = -20
const OVER_SWIPE_DISTANCE = 120
const ACTION_SIZE = 56
const ICON_SIZE = 22

type Props = {
    product: ProductType
    scrollRef: any
    openEditProductModal: (product: ProductType) => void
    openSearchProductsBottomSheet: () => void
    setQuery: (query: string | null) => void
    searchProduct: (product: string, category: Category) => void
}

export default function Product({
    product,
    scrollRef,
    openEditProductModal,
    openSearchProductsBottomSheet,
    setQuery,
    searchProduct,
}: Props) {
    const { vars, actions: themesActions } = useThemes()
    const { theme } = useSettingsStore()
    const { actions: productsListActions } = useProductsList()

    const offsetX = useSharedValue(0)
    const startX = useSharedValue(0)
    const pressed = useSharedValue(false)
    const triggeredHaptic = useSharedValue(false)
    const longPressProgress = useSharedValue(0)
    const searchingDelay = useSharedValue(0)
    const openSheetDelay = useSharedValue(0)
    const longPressTriggered = useSharedValue(false)

    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .failOffsetY([-10, 10])
        .onBegin(() => {
            startX.value = offsetX.value
        })
        .onUpdate((e) => {
            const newX = startX.value + e.translationX
            offsetX.value = Math.min(0, newX)
        })
        .onEnd(() => {
            if (offsetX.value < SWIPE_DISTANCE - OVER_SWIPE_DISTANCE) {
                offsetX.value = withTiming(-500, { duration: 200 }, (finished) => {
                    if (finished) scheduleOnRN(productsListActions.deleteProduct, product)
                })
                return
            }
            const distanceToClosed = Math.abs(offsetX.value)
            const distanceToOpen = Math.abs(offsetX.value - SWIPE_DISTANCE)
            if (distanceToOpen < distanceToClosed) {
                offsetX.value = withTiming(SWIPE_DISTANCE, { duration: 200 })
            } else {
                offsetX.value = withTiming(0, { duration: 200 })
            }
        })
        .simultaneousWithExternalGesture(scrollRef)

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: offsetX.value }],
    }))

    const backgroundAnimatedStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            pressed.value || offsetX.value < 0 ? 1 : 0,
            [0, 1],
            [vars.backgroundColor, vars.secondaryBackgroundColor]
        ),
    }))

    const deleteBackgroundStyle = useAnimatedStyle(() => {
        const isVisible = offsetX.value < SWIPE_THRESHOLD
        const passedDeletePoint = offsetX.value < SWIPE_DISTANCE - OVER_SWIPE_DISTANCE

        const baseWidth = isVisible ? 48 : 0
        const extraWidth = isVisible ? Math.max(0, -(offsetX.value - SWIPE_DISTANCE)) : 0

        if (passedDeletePoint && !triggeredHaptic.value) {
            triggeredHaptic.value = true
            scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Medium)
        } else if (!passedDeletePoint) {
            triggeredHaptic.value = false
        }

        return {
            width: baseWidth + extraWidth,
            opacity: isVisible ? 1 : 0,
            borderRadius: 24,
            justifyContent: "center",
            alignItems: passedDeletePoint ? "flex-start" : "center",
            paddingLeft: passedDeletePoint ? 16 : 0,
        }
    })

    return (
        <>
            <GestureHandlerRootView>
                <View style={styles.wrapper}>
                    <View style={styles.deleteBackground}>
                        <View
                            style={[
                                styles.editIconWrapper,
                                {
                                    width: ACTION_SIZE,
                                    height: ACTION_SIZE,
                                    borderWidth: 1,
                                    backgroundColor: vars.secondaryBackgroundColor,
                                    borderColor: vars.secondaryBorderColor,
                                    borderRadius: ACTION_SIZE / 2,
                                },
                            ]}
                        >
                            <PressableScale
                                onPress={() =>
                                    (offsetX.value = withTiming(0, { duration: 150 }, (finished) => {
                                        if (finished) scheduleOnRN(openEditProductModal, product)
                                    }))
                                }
                            >
                                <Pencil size={ICON_SIZE} color={vars.textColor} />
                            </PressableScale>
                        </View>

                        <Animated.View style={[styles.deleteBackgroundInner, deleteBackgroundStyle]}>
                            <PressableScale
                                onPress={() => productsListActions.deleteProduct(product)}
                                style={[
                                    styles.deleteIconWrapper,
                                    {
                                        width: ACTION_SIZE,
                                        height: ACTION_SIZE,
                                        borderRadius: ACTION_SIZE / 2,
                                        backgroundColor: "#EF4444",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    },
                                ]}
                            >
                                <Trash size={ICON_SIZE} color="white" />
                            </PressableScale>
                        </Animated.View>
                    </View>

                    <GestureDetector gesture={panGesture}>
                        <Animated.View style={[styles.container, animatedStyle, backgroundAnimatedStyle]}>
                            <PressableScale
                                style={{ flex: 1, flexDirection: "row", gap: 8 }}
                                onPressIn={() => {
                                    if (product.type === "image") return
                                    pressed.value = true
                                    longPressTriggered.value = false

                                    searchingDelay.value = 0
                                    openSheetDelay.value = 0

                                    searchingDelay.value = withTiming(1, { duration: 1000 }, (finished) => {
                                        if (finished) {
                                            scheduleOnRN(setQuery, product.name)
                                        }
                                    })

                                    openSheetDelay.value = withTiming(1, { duration: 3000 }, (finished) => {
                                        if (finished) {
                                            scheduleOnRN(openSearchProductsBottomSheet)
                                        }
                                    })

                                    longPressProgress.value = withTiming(1, { duration: 2000 }, (finished) => {
                                        if (finished) scheduleOnRN(searchProduct, product.name, product.category)
                                    })
                                }}
                                onPressOut={() => {
                                    pressed.value = false

                                    searchingDelay.value = 0
                                    openSheetDelay.value = 0

                                    scheduleOnRN(setQuery, null)

                                    if (!longPressTriggered.value) {
                                        longPressProgress.value = withTiming(0, { duration: 150 })
                                    }
                                }}
                            >
                                {product.url && (
                                    <CustomImage
                                        style={{ borderRadius: 14 }}
                                        url={product.url}
                                        height={100}
                                        width={90}
                                    />
                                )}

                                {!product.url && (
                                    <View style={styles.iconContainer}>
                                        <CategoryIcon category={product.category} />
                                    </View>
                                )}

                                <View style={[styles.textContainer, { borderColor: vars.borderColor }]}>
                                    <View style={{ height: vars.textSize * 1.4, overflow: "hidden" }}>
                                        <Text
                                            style={[
                                                {
                                                    position: "absolute",
                                                    fontSize: vars.textSize,
                                                    color: theme === "light" ? "black" : "white",
                                                    fontWeight: "500",
                                                },
                                            ]}
                                        >
                                            {product.name}
                                        </Text>
                                    </View>

                                    <Text
                                        style={{
                                            fontSize: vars.labelSize,
                                            color: themesActions.getLabelColor(product.user),
                                            marginTop: 8,
                                            textAlign: "right",
                                            fontWeight: "500",
                                        }}
                                    >
                                        added by {product.user}
                                    </Text>
                                </View>
                            </PressableScale>
                        </Animated.View>
                    </GestureDetector>
                </View>
            </GestureHandlerRootView>
        </>
    )
}

const styles = StyleSheet.create({
    wrapper: { width: "100%", marginVertical: 4 },
    container: {
        flexDirection: "row",
        paddingVertical: 12,
        paddingHorizontal: 12,
        gap: 8,
        alignItems: "center",
        borderRadius: 20,
    },
    iconContainer: { width: 48, alignItems: "center", justifyContent: "center" },
    textContainer: {
        flex: 1,
        borderBottomWidth: 1,
        flexDirection: "column",
        justifyContent: "space-between",
        paddingVertical: 4,
    },
    deleteBackground: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingRight: 20,
        display: "flex",
        flexDirection: "row",
        gap: 8,
    },
    deleteBackgroundInner: {
        backgroundColor: "#EF4444",
        height: ACTION_SIZE,
        justifyContent: "center",
        alignItems: "center",
        borderColor: "#e62626",
        borderWidth: 1,
    },
    deleteIconWrapper: {
        width: ACTION_SIZE,
        height: ACTION_SIZE,
        justifyContent: "center",
        alignItems: "center",
    },
    editIconWrapper: {
        justifyContent: "center",
        alignItems: "center",
    },
})
