import { ReactNode, RefObject, useMemo } from "react"
import { StyleSheet, View } from "react-native"
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackgroundProps, BottomSheetView } from "@gorhom/bottom-sheet"
import Animated, { Extrapolation, interpolate, useAnimatedStyle } from "react-native-reanimated"
import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"
import { useSettingsStore } from "@/stores/useSettingsStore"

type Props = {
    sheetRef: RefObject<BottomSheet | null>
    onClose: () => void
    snapPoints?: string[]
    children: ReactNode
    backgroundMode?: "half" | "full"
}

export default function CustomBottomSheet({
    sheetRef,
    snapPoints = ["50%", "85%"],
    onClose,
    children,
    backgroundMode = "full",
}: Props) {
    const { newUI } = useSettingsStore()
    const { vars } = useThemes()

    const memoSnapPoints = useMemo(() => snapPoints, [])

    const SheetBackground = ({ style, animatedIndex }: BottomSheetBackgroundProps) => {
        if (backgroundMode === "half") {
            return (
                <GlassOrBlurView
                    borderColor={newUI ? vars.secondaryBorderColor : `${vars.secondaryBorderColor}50`}
                    backgroundColor={vars.secondaryBackgroundColor}
                    style={[
                        style,
                        {
                            borderRadius: 35,
                            margin: 12,
                        },
                    ]}
                />
            )
        }

        const containerAnimatedStyle = useAnimatedStyle(() => ({
            margin: interpolate(animatedIndex.value, [-1, 0, 1], [12, 12, 0], Extrapolation.CLAMP),
        }))

        const solidOverlayStyle = useAnimatedStyle(() => ({
            opacity: interpolate(animatedIndex.value, [0, 0.5, 1], [0, 0, 1], Extrapolation.CLAMP),
        }))

        return (
            <Animated.View
                style={[
                    style,
                    {
                        borderRadius: 35,
                        overflow: "hidden",
                    },
                    containerAnimatedStyle,
                ]}
            >
                <GlassOrBlurView
                    borderColor={newUI ? vars.secondaryBorderColor : `${vars.secondaryBorderColor}50`}
                    backgroundColor={vars.secondaryBackgroundColor}
                    style={StyleSheet.absoluteFillObject}
                />

                <Animated.View
                    pointerEvents="none"
                    style={[
                        StyleSheet.absoluteFillObject,
                        solidOverlayStyle,
                        {
                            backgroundColor: vars.secondaryBackgroundColor,
                        },
                    ]}
                />
            </Animated.View>
        )
    }

    return (
        <BottomSheet
            ref={sheetRef}
            index={-1}
            snapPoints={memoSnapPoints}
            enablePanDownToClose
            onClose={onClose}
            handleComponent={() => null}
            backgroundComponent={SheetBackground}
            containerStyle={{ zIndex: 10 }}
            backdropComponent={(props) => (
                <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
            )}
        >
            <BottomSheetView
                style={{
                    flex: 1,
                    padding: 25,
                }}
            >
                <View
                    style={{
                        width: "100%",
                        alignItems: "center",
                        paddingBottom: 8,
                        paddingTop: 4,
                    }}
                >
                    <View
                        style={{
                            width: 36,
                            height: 4,
                            borderRadius: 8,
                            backgroundColor: "#666",
                        }}
                    />
                </View>

                {children}
            </BottomSheetView>
        </BottomSheet>
    )
}
