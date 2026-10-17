import { COUNTRIES, HEADER_HEIGHT } from "@/lib/constants"
import { useMemo, useState } from "react"
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import { Country } from "@/types/recipes"
import useThemes from "@/hooks/themes/useThemes"
import { PressableScale } from "pressto"
import { BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

type Props = {
    value?: Country | null
    onChange: (country: Country | null) => void
}

export default function CountryInput({ value, onChange }: Props) {
    const { vars, appearance } = useThemes()

    const [visible, setVisible] = useState(false)
    const [query, setQuery] = useState("")

    const filtered = useMemo(() => {
        const q = query.toLowerCase()
        return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q))
    }, [query])

    return (
        <>
            <PressableScale
                onPress={() => setVisible(true)}
                style={[
                    styles.trigger,
                    {
                        backgroundColor: vars.secondaryBackgroundColor,
                        borderColor: vars.secondaryBorderColor,
                    },
                ]}
            >
                <Text style={styles.flag}>{value?.flag ?? "🌍"}</Text>
                <Text style={[styles.triggerText, { color: vars.textColor }]}>{value?.name ?? "Select country"}</Text>
            </PressableScale>

            <Modal visible={visible} animationType="slide">
                <View style={[styles.modal, { backgroundColor: vars.backgroundColor }]}>
                    <TextInput
                        placeholder="Search country"
                        value={query}
                        onChangeText={setQuery}
                        style={[
                            styles.searchInput,
                            {
                                color: vars.textColor,
                                borderColor: vars.secondaryBorderColor,
                                backgroundColor: vars.secondaryBackgroundColor,
                            },
                        ]}
                        placeholderTextColor={vars.tertiaryTextColor}
                        keyboardAppearance={appearance}
                    />

                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.name}
                        ListHeaderComponent={
                            <Pressable
                                onPress={() => {
                                    onChange(null)
                                    setVisible(false)
                                    setQuery("")
                                }}
                                style={styles.row}
                            >
                                <Text style={[styles.rowText, { color: vars.textColor }]}>None</Text>
                            </Pressable>
                        }
                        renderItem={({ item }) => (
                            <PressableScale
                                onPress={() => {
                                    onChange(item)
                                    setVisible(false)
                                    setQuery("")
                                }}
                                style={styles.row}
                            >
                                <Text style={styles.rowFlag}>{item.flag}</Text>
                                <Text style={[styles.rowText, { color: vars.textColor }]}>{item.name}</Text>
                            </PressableScale>
                        )}
                    />

                    <PressableScale
                        onPress={() => setVisible(false)}
                        style={[styles.closeButton, { backgroundColor: vars.accentColor }]}
                    >
                        <Text style={styles.closeText}>Close</Text>
                    </PressableScale>
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    trigger: {
        borderWidth: 1,
        borderRadius: BORDER_RADIUS_M,
        paddingHorizontal: 12,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    flag: {
        fontSize: 20,
    },
    triggerText: {
        fontSize: 16,
    },
    modal: {
        flex: 1,
        padding: 16,
        paddingTop: HEADER_HEIGHT,
    },
    searchInput: {
        padding: 12,
        borderRadius: BORDER_RADIUS_M,
        borderWidth: 1,
        marginBottom: 12,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        gap: 12,
    },
    rowFlag: {
        fontSize: 22,
    },
    rowText: {
        fontSize: 16,
    },
    closeButton: {
        padding: 16,
        alignItems: "center",
        borderRadius: BORDER_RADIUS_L,
    },
    closeText: {
        fontWeight: "600",
        color: "#fff",
    },
})
