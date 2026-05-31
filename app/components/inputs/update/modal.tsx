import {
    KeyboardAvoidingView,
    Modal as NativeModal,
    Platform,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from "react-native"
import GlassOrBlurView from "@/components/glassOrBlurView"
import ProductPreview from "@/components/products-list/productPreview"
import CloseButton from "@/components/inputs/update/closeButton"
import ProductInput from "@/components/inputs/update/productInput"
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
    return (
        <NativeModal transparent animationType="fade" visible={isOpen} onRequestClose={closeUpdateModal}>
            <TouchableWithoutFeedback onPress={closeUpdateModal}>
                <GlassOrBlurView forceBlur blur={20} style={{ flex: 1 }}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1, width: "100%" }}
                    >
                        <View style={styles.modalContent}>
                            <CloseButton close={closeUpdateModal} />
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: "space-between",
                                    marginBottom: 10,
                                }}
                            >
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
                </GlassOrBlurView>
            </TouchableWithoutFeedback>
        </NativeModal>
    )
}

const styles = StyleSheet.create({
    modalContent: {
        height: "100%",
        width: "100%",
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 60,
    },
})
