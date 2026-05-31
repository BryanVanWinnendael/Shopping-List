import { View } from "react-native"
import { DrawerContentComponentProps, DrawerItemList } from "@react-navigation/drawer"
import { SafeAreaView } from "react-native-safe-area-context"
import { IS_DEV } from "@/lib/constants"
import ThemesBottomSheetButton from "@/components/themes/bottomSheetButton"
import UsersBottomSheetButton from "@/components/users/bottomSheetButton"
import DevScreen from "@/components/devScreen"
import useThemes from "@/hooks/themes/useThemes"

type Props = DrawerContentComponentProps & {
    openThemes: () => void
    openUsers: () => void
}

export default function CustomDrawerContent({ openThemes, openUsers, ...props }: Props) {
    const { vars } = useThemes()

    return (
        <SafeAreaView
            edges={["top", "bottom"]}
            style={{
                flex: 1,
                justifyContent: "space-between",
                backgroundColor: vars.backgroundColor,
            }}
        >
            <View style={{ paddingLeft: 8, paddingRight: 8 }}>
                <UsersBottomSheetButton open={openUsers} />
                <DrawerItemList {...props} />
            </View>

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <ThemesBottomSheetButton open={openThemes} />
                {IS_DEV && <DevScreen />}
            </View>
        </SafeAreaView>
    )
}
