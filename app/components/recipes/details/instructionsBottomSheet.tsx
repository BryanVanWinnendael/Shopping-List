import { BlurView } from "expo-blur"
import { RefObject } from "react"
import { ScrollView, Text, View } from "react-native"

import AppBottomSheet, { BottomSheetRef } from "@/components/native/appBottomSheet"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    sheetRef: RefObject<BottomSheetRef | null>
    close: () => void
    instructions: string[]
}

export default function InstructionsBottomSheet({ sheetRef, close, instructions }: Props) {
    const { vars, theme } = useThemes()

    return (
        <AppBottomSheet
            ref={sheetRef}
            index={-1}
            snapPoints={["55%", "90%"]}
            enablePanDownToClose
            onClose={close}
            backgroundMode="adaptive"
            backgroundColor={vars.backgroundColor}
        >
            <View style={{ flex: 1 }}>
                {/* Header */}
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
                            Instructions
                        </Text>
                    </BlurView>
                </View>

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        paddingHorizontal: 20,
                        paddingTop: 64,
                        paddingBottom: 24,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    {instructions.map((instruction, index) => (
                        <Text
                            key={index}
                            style={{
                                color: vars.textColor,
                                fontSize: 24,
                                lineHeight: 32,
                                marginBottom: 24,
                            }}
                        >
                            <Text
                                style={{
                                    color: vars.accentColor,
                                    fontWeight: "700",
                                }}
                            >
                                {index + 1}.{" "}
                            </Text>

                            {instruction}
                        </Text>
                    ))}
                </ScrollView>
            </View>
        </AppBottomSheet>
    )
}
