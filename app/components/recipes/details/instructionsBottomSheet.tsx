import { BlurView } from "expo-blur"
import { RefObject } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import AppBottomSheet, { BottomSheetRef } from "@/components/native/bottom-sheet/appBottomSheet"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    sheetRef: RefObject<BottomSheetRef | null>
    close: () => void
    instructions: string[]
}

export default function InstructionsBottomSheet({ sheetRef, close, instructions }: Props) {
    const { vars, appearance } = useThemes()

    return (
        <AppBottomSheet
            ref={sheetRef}
            index={-1}
            snapPoints={["55%", "100%"]}
            enablePanDownToClose
            onClose={close}
            backgroundMode="adaptive"
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <BlurView intensity={10} tint={appearance} style={styles.blur}>
                        <Text style={[styles.title, { color: vars.textColor }]}>Instructions</Text>
                    </BlurView>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {instructions.map((instruction, index) => (
                        <Text key={index} style={[styles.instruction, { color: vars.textColor }]}>
                            <Text style={[styles.index, { color: vars.accentColor }]}>{index + 1}. </Text>
                            {instruction}
                        </Text>
                    ))}
                </ScrollView>
            </View>
        </AppBottomSheet>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        position: "absolute",
        top: -40,
        left: 0,
        right: 0,
        height: 88,
        zIndex: 10,
        overflow: "hidden",
    },
    blur: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 64,
        paddingBottom: 24,
    },
    instruction: {
        fontSize: 24,
        lineHeight: 32,
        marginBottom: 24,
    },
    index: {
        fontWeight: "700",
    },
})
