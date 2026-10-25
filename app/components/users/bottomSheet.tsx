import { RefObject, useCallback } from "react"
import { StyleSheet, Text, View } from "react-native"
import ExpoBottomSheet from "@expo/ui/community/bottom-sheet"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { Check } from "lucide-react-native"
import { PressableScale } from "pressto"
import { USERS_ARRAY } from "@/lib/constants"
import { User } from "@/types"
import useThemes from "@/hooks/themes/useThemes"
import AppBottomSheet from "@/components/native/bottom-sheet/appBottomSheet"
import { BORDER_RADIUS_FULL } from "@/lib/theme"

type Props = {
    close: () => void
    sheetRef: RefObject<ExpoBottomSheet | null>
}

export default function BottomSheet({ close, sheetRef }: Props) {
    const { vars, theme } = useThemes()
    const { user, setUser } = useSettingsStore()

    const handleUserChange = useCallback(
        async (newUser: User) => {
            await setUser(newUser)
            close()
        },
        [setUser, close]
    )

    return (
        <AppBottomSheet
            ref={sheetRef}
            index={-1}
            snapPoints={["30%"]}
            enablePanDownToClose
            onClose={close}
            backgroundMode="adaptive"
        >
            <View style={styles.sheetContainer}>
                <Text
                    style={[
                        styles.sheetTitle,
                        {
                            color: theme === "light" ? "#6b7280" : "#9ca3af",
                        },
                    ]}
                >
                    Select User
                </Text>

                {USERS_ARRAY.map((u) => {
                    const isSelected = user === u

                    return (
                        <PressableScale key={u} onPress={() => handleUserChange(u)} style={styles.userOptionContainer}>
                            <Text
                                style={[
                                    styles.userText,
                                    {
                                        color: vars.textColor,
                                    },
                                ]}
                            >
                                {u}
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
        </AppBottomSheet>
    )
}

const styles = StyleSheet.create({
    sheetContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 24,
    },
    sheetTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
    },
    userOptionContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
    },
    userText: {
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
