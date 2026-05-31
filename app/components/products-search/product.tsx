import { StyleSheet, Text, View } from "react-native"
import { IS_DEV } from "@/lib/constants"
import { Product as ProductType } from "@/types/products-search"
import CategoryIcon from "@/components/categoryIcon"
import AddButton from "@/components/products-search/addButton"
import useThemes from "@/hooks/themes/useThemes"
import CustomImage from "@/components/customImage"

type Props = {
    product: ProductType
}

export default function Product({ product }: Props) {
    const { vars, actions } = useThemes()

    return (
        <View
            style={[
                styles.card,
                { backgroundColor: vars.secondaryBackgroundColor, borderColor: vars.secondaryBorderColor },
            ]}
        >
            <View style={styles.innerCard}>
                <CustomImage style={{ borderRadius: 14 }} url={product.image} height={60} width={60} cache={false} />

                <View style={styles.info}>
                    <Text style={[styles.productName, { color: vars.textColor, fontSize: vars.textSize }]}>
                        {product.name}
                    </Text>

                    <Text style={[styles.brandName, { color: actions.getLabelColor(), fontSize: vars.labelSize }]}>
                        {product.brand}
                    </Text>

                    <View style={styles.categoryContainer}>
                        <CategoryIcon category={product.category} size={25} svgSizeSmaller={12} />
                        <Text
                            style={[styles.categoryText, { color: actions.getLabelColor(), fontSize: vars.labelSize }]}
                        >
                            {product.category}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.buttons}>
                {!IS_DEV && (
                    <>
                        <AddButton product={product} mode="image" />
                        <AddButton product={product} mode="text" />
                    </>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: 20,
        padding: 10,
        marginVertical: 10,
        overflow: "hidden",
        position: "relative",
    },
    innerCard: {
        flexDirection: "row",
        alignItems: "center",
    },
    buttons: {
        marginTop: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    info: {
        flex: 1,
        justifyContent: "center",
        position: "relative",
        paddingBottom: 20,
        marginLeft: 20,
    },
    productName: {
        fontWeight: "700",
        marginBottom: 4,
    },
    brandName: {
        fontWeight: "400",
        marginBottom: 8,
    },
    categoryContainer: {
        position: "absolute",
        bottom: 4,
        right: 4,
        flexDirection: "row",
        alignItems: "center",
    },
    categoryText: {
        marginLeft: 4,
        fontWeight: "500",
    },
})
