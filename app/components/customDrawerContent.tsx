import { StyleSheet, View } from "react-native"
import { DrawerItemList } from "expo-router/drawer"
import { SafeAreaView } from "react-native-safe-area-context"

import ThemesBottomSheetButton from "@/components/themes/bottomSheetButton"
import UsersBottomSheetButton from "@/components/users/bottomSheetButton"
import InfoChip from "@/components/infoChip"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    openThemes: () => void
    openUsers: () => void
    state: any
    navigation: any
    descriptors: any
}

export default function CustomDrawerContent({ openThemes, openUsers, ...props }: Props) {
    const { vars } = useThemes()

    return (
        <SafeAreaView edges={["top", "bottom"]} style={[styles.container, { backgroundColor: vars.backgroundColor }]}>
            <View style={styles.top}>
                <UsersBottomSheetButton open={openUsers} />
                <DrawerItemList {...props} />
            </View>

            <View style={styles.bottom}>
                <ThemesBottomSheetButton open={openThemes} />
                <InfoChip />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
    },
    top: {
        paddingLeft: 8,
        paddingRight: 8,
    },
    bottom: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
})
