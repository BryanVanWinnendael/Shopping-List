import { RefObject, useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"
import GorhomBottomSheet from "@gorhom/bottom-sheet"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { Theme } from "@/types"
import { Check } from "lucide-react-native"
import { PressableScale } from "pressto"
import CustomBottomSheet from "@/components/customBottomSheet"
import { THEMES } from "@/lib/constants"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    close: () => void
    sheetRef: RefObject<GorhomBottomSheet | null>
}

export default function BottomSheet({ close, sheetRef }: Props) {
    const { vars } = useThemes()
    const { theme, setTheme } = useSettingsStore()
    const snapPoints = useMemo(() => ["20%"], [])

    const selectTheme = (newTheme: Theme) => {
        setTheme(newTheme)
    }

    return (
        <CustomBottomSheet sheetRef={sheetRef} snapPoints={snapPoints} onClose={close} backgroundMode={"half"}>
            <Text style={[styles.sheetTitle, { color: theme === "light" ? "gray" : "#50555C" }]}>Select Theme</Text>

            {THEMES.map((item) => {
                const isSelected = theme === item.key
                return (
                    <PressableScale
                        key={item.key}
                        onPress={() => selectTheme(item.key)}
                        style={styles.themeOptionContainer}
                    >
                        <Text
                            style={{
                                color: vars.textColor,
                                fontSize: 16,
                            }}
                        >
                            {item.label}
                        </Text>

                        <View
                            style={{
                                width: 20,
                                height: 20,
                                borderRadius: 999,
                                borderWidth: 2,
                                borderColor: isSelected ? vars.accentColor : "gray",
                                backgroundColor: isSelected ? vars.accentColor : "transparent",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {isSelected && <Check size={14} color="white" strokeWidth={3} />}
                        </View>
                    </PressableScale>
                )
            })}
        </CustomBottomSheet>
    )
}

const styles = StyleSheet.create({
    sheetTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },
    themeOptionContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
    },
})
