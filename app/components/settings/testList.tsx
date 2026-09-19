import { StyleSheet, Text, View } from "react-native"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { PressableScale } from "pressto"
import { CATEGORY_ORDER } from "@/lib/constants"
import { createTestProduct, deleteProduct } from "@/lib/firebase"
import uuid from "react-native-uuid"
import { useProductsListStore } from "@/stores/useProductsListStore"
import useThemes from "@/hooks/themes/useThemes"
import { GlassView } from "expo-glass-effect"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L } from "@/lib/theme"

export default function TestList() {
    const { vars, theme } = useThemes()
    const { user } = useSettingsStore()
    const { products } = useProductsListStore()

    const colorScheme = theme === "light" ? "light" : "dark"

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
            <GlassView
                glassEffectStyle="regular"
                colorScheme={colorScheme}
                tintColor={vars.secondaryBackgroundColor}
                style={styles.container}
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

                    <GlassView
                        glassEffectStyle="regular"
                        isInteractive
                        colorScheme={colorScheme}
                        style={styles.buttonGlass}
                    >
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
                    </GlassView>
                </View>
            </GlassView>

            <GlassView
                glassEffectStyle="regular"
                colorScheme={colorScheme}
                tintColor={vars.secondaryBackgroundColor}
                style={styles.container}
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

                    <GlassView
                        glassEffectStyle="regular"
                        isInteractive
                        colorScheme={colorScheme}
                        style={styles.buttonGlass}
                    >
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
                    </GlassView>
                </View>
            </GlassView>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: BORDER_RADIUS_L,
        paddingHorizontal: 16,
        marginHorizontal: 8,
        paddingBottom: 16,
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
        overflow: "hidden",
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
