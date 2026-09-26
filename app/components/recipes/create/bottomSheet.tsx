import { BlurView } from "expo-blur"
import { KeyboardAvoidingView, Platform, Text, View } from "react-native"
import { RefObject } from "react"
import Form from "@/components/recipes/create/form"
import useThemes from "@/hooks/themes/useThemes"
import AppBottomSheet, { BottomSheetRef } from "@/components/native/appBottomSheet"

type Props = {
    sheetRef: RefObject<BottomSheetRef | null>
    onClose: () => void
}

export default function BottomSheet({ sheetRef, onClose }: Props) {
    const { vars, theme } = useThemes()

    return (
        <AppBottomSheet
            ref={sheetRef}
            index={-1}
            snapPoints={["55%", "75%", "100%"]}
            enablePanDownToClose
            onClose={onClose}
            backgroundMode="adaptive"
            backgroundColor={vars.backgroundColor}
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
                        tint={theme === "light" ? "light" : "dark"}
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

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={0}
                >
                    <Form onClose={onClose} />
                </KeyboardAvoidingView>
            </View>
        </AppBottomSheet>
    )
}
