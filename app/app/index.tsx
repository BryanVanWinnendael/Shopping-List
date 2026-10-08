import { useCallback, useRef } from "react"
import { NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from "react-native"
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import List from "@/components/products-list/list"
import BottomSheet from "@/components/products-list/products-search/bottomSheet"
import { Modal } from "@/components/inputs/update/modal"
import ProductInput from "@/components/inputs/productInput"
import { useUpdateProduct } from "@/hooks/products-list/useUpdateProduct"
import { useUpdateProductModal } from "@/hooks/products-list/useUpdateProductModal"
import { useProductsSearchList } from "@/hooks/products-search/useProductsSearchList"
import useThemes from "@/hooks/themes/useThemes"

const SCROLL_THRESHOLD = 3
const SHRUNK_SCALE = 0.82
const FULL_SCALE = 1

const IOS_ANIMATION = {
    duration: 280,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
}

export default function Index() {
    const { vars } = useThemes()
    const { actions: editItemActions, states: editItemStates } = useUpdateProduct()
    const { actions: editModalActions, states: editModalStates } = useUpdateProductModal()
    const { actions: productsSearchActions, states: productsSearchStates } = useProductsSearchList()

    const inputScale = useSharedValue(FULL_SCALE)
    const isInputFocused = useRef(false)
    const previousScrollY = useRef(0)

    const inputAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: inputScale.value }],
    }))

    const handleInputFocus = useCallback(() => {
        isInputFocused.current = true
        inputScale.value = withTiming(FULL_SCALE, IOS_ANIMATION)
    }, [inputScale])

    const handleInputBlur = useCallback(() => {
        isInputFocused.current = false
    }, [])

    const handleScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            // Clamp first, so iOS rubber-banding (negative offsets) doesn't skew the delta.
            const currentScrollY = Math.max(0, event.nativeEvent.contentOffset.y)
            const scrollDelta = currentScrollY - previousScrollY.current

            previousScrollY.current = currentScrollY

            // Keep the input full-size while typing.
            if (isInputFocused.current) return

            if (scrollDelta > SCROLL_THRESHOLD) {
                inputScale.value = withTiming(SHRUNK_SCALE, IOS_ANIMATION)
            } else if (scrollDelta < -SCROLL_THRESHOLD) {
                inputScale.value = withTiming(FULL_SCALE, IOS_ANIMATION)
            }
        },
        [inputScale]
    )

    const closeUpdateModal = useCallback(() => {
        editItemActions.reset()
        editModalActions.close()
    }, [editItemActions, editModalActions])

    const updateProduct = useCallback(async () => {
        await editItemActions.updateProduct()
        editModalActions.close()
    }, [editItemActions, editModalActions])

    return (
        <>
            <View style={[styles.container, { backgroundColor: vars.backgroundColor }]}>
                <List
                    setProduct={editItemActions.setProduct}
                    openEditModal={editModalActions.open}
                    openSearchProductsBottomSheet={productsSearchActions.open}
                    setQuery={productsSearchActions.setQuery}
                    searchProduct={productsSearchActions.searchProduct}
                    onScroll={handleScroll}
                />

                <View pointerEvents="box-none" style={styles.inputOverlay}>
                    <Animated.View style={[styles.animatedInput, inputAnimatedStyle]}>
                        <ProductInput onFocus={handleInputFocus} onBlur={handleInputBlur} />
                    </Animated.View>
                </View>

                <BottomSheet onClose={productsSearchActions.close} sheetRef={productsSearchStates.bottomSheetRef} />
            </View>

            <Modal
                closeUpdateModal={closeUpdateModal}
                product={editItemStates.product}
                name={editItemStates.name}
                updateName={editItemActions.updateProductPreview}
                updateProduct={updateProduct}
                isOpen={editModalStates.visible}
            />
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    inputOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: "flex-end",
    },
    animatedInput: {
        transformOrigin: "bottom",
    },
})
