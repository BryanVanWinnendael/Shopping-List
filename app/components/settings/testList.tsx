import { StyleSheet, Text, View } from "react-native"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { PressableScale } from "pressto"
import { CATEGORY_ORDER } from "@/lib/constants"
import { createTestProduct, deleteProduct } from "@/lib/firebase"
import uuid from "react-native-uuid"
import { useProductsListStore } from "@/stores/useProductsListStore"
import useThemes from "@/hooks/themes/useThemes"

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
                        borderWidth: 1,
                    },
                ]}
            >
                <View style={styles.row}>
                    <Text style={[styles.title, { color: vars.textColor }]}>Test Add List</Text>
                    <PressableScale
                        style={[
                            styles.button,
                            { borderColor: vars.borderColor, backgroundColor: vars.backgroundColor },
                        ]}
                        onPress={handleAddTestList}
                    >
                        <Text style={[styles.buttonText, { color: vars.textColor }]}>Add Test Items</Text>
                    </PressableScale>
                </View>
            </View>
            <View
                style={[
                    styles.container,
                    {
                        backgroundColor: vars.secondaryBackgroundColor,
                        borderColor: vars.secondaryBorderColor,
                        borderWidth: 0.2,
                    },
                ]}
            >
                <View style={styles.row}>
                    <Text style={[styles.title, { color: vars.textColor }]}>Test Remove List</Text>
                    <PressableScale
                        style={[
                            styles.button,
                            { borderColor: vars.borderColor, backgroundColor: vars.backgroundColor },
                        ]}
                        onPress={handleRemoveTestList}
                    >
                        <Text style={[styles.buttonText, { color: vars.textColor }]}>Remove All Items</Text>
                    </PressableScale>
                </View>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        paddingHorizontal: 16,
        marginHorizontal: 8,
        paddingBottom: 16,
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
    button: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 24,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    buttonText: {
        fontSize: 15,
    },
    containerTest: {
        flexDirection: "row",
        gap: 15,
    },
})
