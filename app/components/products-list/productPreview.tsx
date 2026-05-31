import { StyleSheet, Text, View } from "react-native"
import { Product } from "@/types/list"
import CategoryIcon from "@/components/categoryIcon"
import useThemes from "@/hooks/themes/useThemes"
import CustomImage from "@/components/customImage"
import GlassOrBlurView from "@/components/glassOrBlurView"

type Props = {
    product: Product
}

export default function ProductPreview({ product }: Props) {
    const { vars, actions } = useThemes()

    return (
        <GlassOrBlurView
            borderColor={vars.secondaryBorderColor}
            backgroundColor={vars.secondaryBackgroundColor}
            style={[styles.container]}
        >
            {product.url && <CustomImage url={product.url} style={styles.image} />}

            {!product.url && (
                <View style={styles.iconContainer}>
                    <CategoryIcon category={product.category} />
                </View>
            )}

            <View style={[styles.textContainer, { borderColor: vars.secondaryBorderColor }]}>
                <Text
                    style={{
                        fontSize: vars.textSize,
                        flexWrap: "wrap",
                        color: vars.textColor,
                        fontWeight: "500",
                    }}
                >
                    {product.name}
                </Text>
                <Text
                    style={{
                        fontSize: vars.labelSize,
                        color: actions.getLabelColor(product.user),
                        marginTop: 8,
                        textAlign: "right",
                        fontWeight: "500",
                    }}
                >
                    added by {product.user}
                </Text>
            </View>
        </GlassOrBlurView>
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
        borderWidth: 1,
        borderRadius: 20,
    },
    iconContainer: { width: 48, alignItems: "center", justifyContent: "center" },
    textContainer: { flex: 1, borderBottomWidth: 1 },
    image: { width: 90, height: 100, borderRadius: 12 },
})
