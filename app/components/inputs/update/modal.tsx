import {
    KeyboardAvoidingView,
    Modal as NativeModal,
    Platform,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from "react-native"
import { BlurView } from "expo-blur"

import ProductPreview from "@/components/products-list/productPreview"
import CloseButton from "@/components/inputs/update/closeButton"
import ProductInput from "@/components/inputs/update/productInput"
import useThemes from "@/hooks/themes/useThemes"
import { Product } from "@/types/list"

type Props = {
    isOpen: boolean
    closeUpdateModal: () => void
    product: Product | null
    name: string
    updateName: (name: string) => void
    updateProduct: () => void
}

export function Modal({ isOpen, closeUpdateModal, product, name, updateName, updateProduct }: Props) {
    const { appearance } = useThemes()

    return (
        <NativeModal transparent animationType="fade" visible={isOpen} onRequestClose={closeUpdateModal}>
            <TouchableWithoutFeedback onPress={closeUpdateModal}>
                <BlurView intensity={24} tint={appearance} style={styles.backdrop}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.keyboardView}
                    >
                        <View style={styles.modalContent}>
                            <CloseButton close={closeUpdateModal} />

                            <View style={styles.content}>
                                {product && <ProductPreview product={product} />}

                                <ProductInput
                                    product={product}
                                    value={name}
                                    updateName={updateName}
                                    updateProduct={updateProduct}
                                />
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </BlurView>
            </TouchableWithoutFeedback>
        </NativeModal>
    )
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        width: "100%",
    },

    keyboardView: {
        flex: 1,
        width: "100%",
    },

    modalContent: {
        flex: 1,
        width: "100%",
        height: "100%",
        paddingHorizontal: 12,
        paddingTop: 60,
    },

    content: {
        flex: 1,
        justifyContent: "space-between",
        marginBottom: 10,
    },
})
