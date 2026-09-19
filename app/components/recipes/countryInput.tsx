import { COUNTRIES, HEADER_HEIGHT } from "@/lib/constants"
import { useMemo, useState } from "react"
import { FlatList, Modal, Pressable, Text, TextInput, View } from "react-native"
import { Country } from "@/types/recipes"
import useThemes from "@/hooks/themes/useThemes"
import { PressableScale } from "pressto"
import { BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"

type Props = {
    value?: Country | null
    onChange: (country: Country | null) => void
}

export default function CountryInput({ value, onChange }: Props) {
    const { vars, theme } = useThemes()

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
                style={{
                    backgroundColor: vars.secondaryBackgroundColor,
                    borderWidth: 1,
                    borderColor: vars.secondaryBorderColor,
                    borderRadius: BORDER_RADIUS_M,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <Text style={{ fontSize: 20 }}>{value?.flag ?? "🌍"}</Text>
                <Text style={{ fontSize: 16, color: vars.textColor }}>{value?.name ?? "Select country"}</Text>
            </PressableScale>

            <Modal visible={visible} animationType="slide">
                <View
                    style={{
                        flex: 1,
                        padding: 16,
                        paddingTop: HEADER_HEIGHT,
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
                            borderRadius: BORDER_RADIUS_M,
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
                            <PressableScale
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
                            </PressableScale>
                        )}
                    />

                    <PressableScale
                        onPress={() => setVisible(false)}
                        style={{
                            padding: 16,
                            alignItems: "center",
                            borderRadius: BORDER_RADIUS_L,
                            backgroundColor: vars.accentColor,
                        }}
                    >
                        <Text style={{ fontWeight: "600", color: "#fff" }}>Close</Text>
                    </PressableScale>
                </View>
            </Modal>
        </>
    )
}
