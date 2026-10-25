import { RefObject } from "react"
import { StyleSheet, Text, View } from "react-native"
import ExpoBottomSheet from "@expo/ui/community/bottom-sheet"
import { Check } from "lucide-react-native"
import { PressableScale } from "pressto"

import { useSettingsStore } from "@/stores/useSettingsStore"
import { Theme } from "@/types"
import { THEMES } from "@/lib/constants"
import useThemes from "@/hooks/themes/useThemes"
import { BORDER_RADIUS_FULL } from "@/lib/theme"
import AppBottomSheet from "@/components/native/bottom-sheet/appBottomSheet"

type Props = {
    close: () => void
    sheetRef: RefObject<ExpoBottomSheet | null>
}

export default function BottomSheet({ close, sheetRef }: Props) {
    const { vars } = useThemes()
    const { theme, setTheme } = useSettingsStore()

    const selectTheme = (newTheme: Theme) => {
        setTheme(newTheme)
    }

    return (
        <AppBottomSheet
            ref={sheetRef}
            index={-1}
            snapPoints={["25%"]}
            enablePanDownToClose
            onClose={close}
            backgroundMode="adaptive"
        >
            <View style={styles.container}>
                <Text
                    style={[
                        styles.sheetTitle,
                        {
                            color: theme === "light" ? "#6b7280" : "#9ca3af",
                        },
                    ]}
                >
                    Select Theme
                </Text>

                <View style={styles.options}>
                    {THEMES.map((item) => {
                        const isSelected = theme === item.key

                        return (
                            <PressableScale
                                key={item.key}
                                onPress={() => selectTheme(item.key)}
                                style={styles.themeOptionContainer}
                            >
                                <Text
                                    style={[
                                        styles.themeText,
                                        {
                                            color: vars.textColor,
                                        },
                                    ]}
                                >
                                    {item.label}
                                </Text>

                                <View
                                    style={[
                                        styles.checkCircle,
                                        {
                                            borderColor: isSelected
                                                ? vars.accentColor
                                                : theme === "light"
                                                  ? "#9ca3af"
                                                  : "#50555C",
                                            backgroundColor: isSelected ? vars.accentColor : "transparent",
                                        },
                                    ]}
                                >
                                    {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
                                </View>
                            </PressableScale>
                        )
                    })}
                </View>
            </View>
        </AppBottomSheet>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8,
    },
    options: {
        width: "100%",
    },
    themeOptionContainer: {
        minHeight: 48,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
    },
    themeText: {
        fontSize: 16,
    },
    checkCircle: {
        width: 20,
        height: 20,
        borderRadius: BORDER_RADIUS_FULL,
        borderWidth: 2,
        alignItems: "center",
        justifyContent: "center",
    },
})
