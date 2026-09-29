import { StyleSheet, Text, View } from "react-native"
import { GlassView } from "expo-glass-effect"

import { Product } from "@/types/list"
import CategoryIcon from "@/components/categoryIcon"
import useThemes from "@/hooks/themes/useThemes"
import CustomImage from "@/components/customImage"
import { BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

type Props = {
    product: Product
}

export default function ProductPreview({ product }: Props) {
    const { vars, actions, appearance } = useThemes()

    return (
        <GlassView colorScheme={appearance} glassEffectStyle="regular" style={styles.container}>
            {product.url && <CustomImage url={product.url} style={styles.image} />}

            {!product.url && (
                <View style={styles.iconContainer}>
                    <CategoryIcon category={product.category} />
                </View>
            )}

            <View style={styles.textContainer}>
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
        </GlassView>
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
    },
    iconContainer: {
        width: 48,
        alignItems: "center",
        justifyContent: "center",
    },
    textContainer: {
        flex: 1,
    },
    image: {
        width: 90,
        height: 100,
        borderRadius: BORDER_RADIUS_M,
    },
})
