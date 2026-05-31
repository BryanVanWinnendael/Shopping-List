import { RefObject, useCallback, useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"
import GorhomBottomSheet from "@gorhom/bottom-sheet"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { Check } from "lucide-react-native"
import { PressableScale } from "pressto"
import { USERS_ARRAY } from "@/lib/constants"
import { User } from "@/types"
import CustomBottomSheet from "@/components/customBottomSheet"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    close: () => void
    sheetRef: RefObject<GorhomBottomSheet | null>
}

export default function BottomSheet({ close, sheetRef }: Props) {
    const { vars, theme } = useThemes()
    const { user, setUser } = useSettingsStore()
    const snapPoints = useMemo(() => ["30%"], [])

    const handleUserChange = useCallback(async (newUser: User) => {
        await setUser(newUser)
        close()
    }, [])

    return (
        <CustomBottomSheet sheetRef={sheetRef} onClose={close} snapPoints={snapPoints} backgroundMode={"half"}>
            <Text style={[styles.sheetTitle, { color: theme === "light" ? "gray" : "#50555C" }]}>Select User</Text>

            {USERS_ARRAY.map((u) => {
                const isSelected = user === u
                return (
                    <PressableScale key={u} onPress={() => handleUserChange(u)} style={styles.userOptionContainer}>
                        <Text
                            style={{
                                color: vars.textColor,
                                fontSize: 16,
                            }}
                        >
                            {u}
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
    sheetContainer: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 12,
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
})
