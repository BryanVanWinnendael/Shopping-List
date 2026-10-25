import { StyleSheet, Text, View } from "react-native"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { PressableScale } from "pressto"
import { CATEGORY_ORDER } from "@/lib/constants"
import { createTestProduct, deleteProduct } from "@/lib/firebase"
import uuid from "react-native-uuid"
import { useProductsListStore } from "@/stores/useProductsListStore"
import useThemes from "@/hooks/themes/useThemes"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L } from "@/lib/theme"

export default function TestList() {
    const { vars } = useThemes()
    const { user } = useSettingsStore()
    const { products } = useProductsListStore()

    const handleAddTestList = async () => {
        if (!user) return

        await Promise.all(
            CATEGORY_ORDER.map((category) =>
                createTestProduct({
                    id: uuid.v4(),
                    name: category,
                    type: "text",
                    user: user,
                    date: Date.now(),
                    category,
                })
            )
        )
    }

    const handleRemoveTestList = async () => {
        if (!products) return

        for (const item of Object.values(products)) {
            await deleteProduct(item)
        }
    }

    return (
        <>
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: vars.secondaryBackgroundColor,
                        borderColor: vars.secondaryBorderColor,
                    },
                ]}
            >
                <View style={styles.row}>
                    <Text
                        style={[
                            styles.title,
                            {
                                color: vars.textColor,
                            },
                        ]}
                    >
                        Test Add List
                    </Text>

                    <LiquidGlassView style={styles.buttonGlass} isInteractive>
                        <PressableScale onPress={handleAddTestList} style={styles.button}>
                            <Text
                                style={[
                                    styles.buttonText,
                                    {
                                        color: vars.textColor,
                                    },
                                ]}
                            >
                                Add Test Items
                            </Text>
                        </PressableScale>
                    </LiquidGlassView>
                </View>
            </View>

            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: vars.secondaryBackgroundColor,
                        borderColor: vars.secondaryBorderColor,
                    },
                ]}
            >
                <View style={styles.row}>
                    <Text
                        style={[
                            styles.title,
                            {
                                color: vars.textColor,
                            },
                        ]}
                    >
                        Test Remove List
                    </Text>

                    <LiquidGlassView style={styles.buttonGlass} isInteractive>
                        <PressableScale onPress={handleRemoveTestList} style={styles.button}>
                            <Text
                                style={[
                                    styles.buttonText,
                                    {
                                        color: vars.textColor,
                                    },
                                ]}
                            >
                                Remove All Items
                            </Text>
                        </PressableScale>
                    </LiquidGlassView>
                </View>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BORDER_RADIUS_L,
        paddingHorizontal: 16,
        marginHorizontal: 8,
        paddingBottom: 16,
        borderWidth: 1,
        overflow: "hidden",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 16,
    },
    title: {
        fontWeight: "600",
        fontSize: 16,
    },
    buttonGlass: {
        minWidth: 58,
        height: 36,
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    button: {
        minWidth: 58,
        height: 36,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 14,
    },
    buttonText: {
        fontSize: 13,
        fontWeight: "600",
    },
})
