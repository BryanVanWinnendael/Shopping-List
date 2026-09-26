import { NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from "react-native"
import List from "@/components/products-list/list"
import { useUpdateProduct } from "@/hooks/products-list/useUpdateProduct"
import { useUpdateProductModal } from "@/hooks/products-list/useUpdateProductModal"
import { useProductsSearchList } from "@/hooks/products-search/useProductsSearchList"
import BottomSheet from "@/components/products-list/products-search/bottomSheet"
import { Modal } from "@/components/inputs/update/modal"
import ProductInput from "@/components/inputs/productInput"
import useThemes from "@/hooks/themes/useThemes"
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import { useRef } from "react"

export default function Index() {
    const { vars } = useThemes()
    const { actions: editItemActions, states: editItemStates } = useUpdateProduct()
    const { actions: editModalActions, states: editModalStates } = useUpdateProductModal()
    const { actions: productsSearchActions, states: productsSearchStates } = useProductsSearchList()

    const isInputFocused = useRef(false)
    const inputScale = useSharedValue(1)
    const iosAnimation = {
        duration: 280,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }
    const previousScrollY = useRef(0)

    const handleInputBlur = () => {
        isInputFocused.current = false
    }

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const currentScrollY = event.nativeEvent.contentOffset.y
        const scrollDelta = currentScrollY - previousScrollY.current

        previousScrollY.current = Math.max(0, currentScrollY)

        // Keep the input full-size while typing.
        if (isInputFocused.current) return

        if (scrollDelta > 3) {
            inputScale.value = withTiming(0.82, iosAnimation)
        } else if (scrollDelta < -3) {
            inputScale.value = withTiming(1, iosAnimation)
        }
    }

    const handleInputFocus = () => {
        isInputFocused.current = true
        inputScale.value = withTiming(1, iosAnimation)
    }

    const inputAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: inputScale.value }],
    }))

    const closeUpdateModal = () => {
        editItemActions.reset()
        editModalActions.close()
    }

    const updateProduct = async () => {
        await editItemActions.updateProduct()
        editModalActions.close()
    }

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
        width: "100%",
        backgroundColor: "transparent",
        justifyContent: "flex-end",
    },
    animatedInput: {
        transformOrigin: "bottom",
    },
})
