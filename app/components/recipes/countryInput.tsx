import { COUNTRIES } from "@/lib/constants"
import { useHeaderHeight } from "@react-navigation/elements"
import { useMemo, useState } from "react"
import { FlatList, Modal, Pressable, Text, TextInput, View } from "react-native"
import { Country } from "@/types/recipes"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    value?: Country | null
    onChange: (country: Country | null) => void
}

export default function CountryInput({ value, onChange }: Props) {
    const { vars, theme } = useThemes()
    const headerHeight = useHeaderHeight()

    const [visible, setVisible] = useState(false)
    const [query, setQuery] = useState("")

    const filtered = useMemo(() => {
        const q = query.toLowerCase()
        return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q))
    }, [query])

    return (
        <>
            <Pressable
                onPress={() => setVisible(true)}
                style={{
                    backgroundColor: vars.secondaryBackgroundColor,
                    borderWidth: 1,
                    borderColor: vars.secondaryBorderColor,
                    borderRadius: 14,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <Text style={{ fontSize: 20 }}>{value?.flag ?? "🌍"}</Text>
                <Text style={{ fontSize: 16, color: vars.textColor }}>{value?.name ?? "Select country"}</Text>
            </Pressable>

            <Modal visible={visible} animationType="slide">
                <View
                    style={{
                        flex: 1,
                        padding: 16,
                        paddingTop: headerHeight,
                        backgroundColor: vars.backgroundColor,
                    }}
                >
                    <TextInput
                        placeholder="Search country"
                        value={query}
                        onChangeText={setQuery}
                        style={{
                            color: vars.textColor,
                            padding: 12,
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: vars.borderColor,
                            marginBottom: 12,
                        }}
                        placeholderTextColor="#aaa"
                        keyboardAppearance={theme === "light" ? "light" : "dark"}
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
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingVertical: 12,
                                    gap: 12,
                                }}
                            >
                                <Text style={{ fontSize: 16, color: vars.textColor }}>None</Text>
                            </Pressable>
                        }
                        renderItem={({ item }) => (
                            <Pressable
                                onPress={() => {
                                    onChange(item)
                                    setVisible(false)
                                    setQuery("")
                                }}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingVertical: 12,
                                    gap: 12,
                                }}
                            >
                                <Text style={{ fontSize: 22 }}>{item.flag}</Text>
                                <Text style={{ fontSize: 16, color: vars.textColor }}>{item.name}</Text>
                            </Pressable>
                        )}
                    />

                    <Pressable
                        onPress={() => setVisible(false)}
                        style={{
                            padding: 16,
                            alignItems: "center",
                            borderRadius: 24,
                            backgroundColor: vars.accentColor,
                        }}
                    >
                        <Text style={{ fontWeight: "600", color: vars.textColor }}>Close</Text>
                    </Pressable>
                </View>
            </Modal>
        </>
    )
}
