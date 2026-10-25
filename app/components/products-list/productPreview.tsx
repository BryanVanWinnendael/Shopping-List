import { StyleSheet, Text, View } from "react-native"
import LiquidGlassView from "@/components/native/liquidGlassView"

import { Product } from "@/types/list"
import CategoryIcon from "@/components/categoryIcon"
import useThemes from "@/hooks/themes/useThemes"
import CustomImage from "@/components/customImage"
import { BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

type Props = {
    product: Product
}

export default function ProductPreview({ product }: Props) {
    const { vars, actions } = useThemes()

    return (
        <LiquidGlassView style={styles.container}>
            {product.url && <CustomImage url={product.url} style={styles.image} />}

            {!product.url && (
                <View style={styles.iconContainer}>
                    <CategoryIcon category={product.category} />
                </View>
            )}

            <View style={styles.textContainer}>
                <Text style={[styles.productName, { fontSize: vars.textSize, color: vars.textColor }]}>
                    {product.name}
                </Text>

                <Text
                    style={[styles.addedBy, { fontSize: vars.labelSize, color: actions.getLabelColor(product.user) }]}
                >
                    added by {product.user}
                </Text>
            </View>
        </LiquidGlassView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        marginTop: 10,
        paddingVertical: 12,
        paddingHorizontal: 12,
        gap: 8,
        alignItems: "center",
        borderRadius: BORDER_RADIUS_L,
        overflow: "hidden",
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        alignItems: "center",
        justifyContent: "center",
    },
    textContainer: {
        flex: 1,
    },
    productName: {
        flexWrap: "wrap",
        fontWeight: "500",
    },
    addedBy: {
        marginTop: 8,
        textAlign: "right",
        fontWeight: "500",
    },
    image: {
        width: 90,
        height: 100,
        borderRadius: BORDER_RADIUS_M,
    },
})
