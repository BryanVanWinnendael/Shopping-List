import { BlurView } from "expo-blur"
import { Text, View } from "react-native"
import { RefObject } from "react"
import Form from "@/components/recipes/create/form"
import useThemes from "@/hooks/themes/useThemes"
import AppBottomSheet, { BottomSheetRef } from "@/components/native/bottom-sheet/appBottomSheet"

type Props = {
    sheetRef: RefObject<BottomSheetRef | null>
    onClose: () => void
}

export default function BottomSheet({ sheetRef, onClose }: Props) {
    const { vars, appearance } = useThemes()

    return (
        <AppBottomSheet
            ref={sheetRef}
            index={-1}
            snapPoints={["55%", "75%", "100%"]}
            enablePanDownToClose
            onClose={onClose}
            backgroundMode="adaptive"
        >
            <View style={{ flex: 1 }}>
                <View
                    style={{
                        position: "absolute",
                        top: -40,
                        left: 0,
                        right: 0,
                        height: 88,
                        zIndex: 10,
                        overflow: "hidden",
                    }}
                >
                    <BlurView
                        intensity={10}
                        tint={appearance}
                        style={{
                            flex: 1,
                            paddingHorizontal: 20,
                            paddingTop: 48,
                            paddingBottom: 10,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 22,
                                fontWeight: "700",
                                color: vars.textColor,
                            }}
                        >
                            Create a Recipe
                        </Text>
                    </BlurView>
                </View>

                <Form onClose={onClose} />
            </View>
        </AppBottomSheet>
    )
}
