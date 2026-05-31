import { ReactNode, RefObject, useEffect, useMemo, useState } from "react"
import { StyleSheet, View } from "react-native"
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackgroundProps, BottomSheetView } from "@gorhom/bottom-sheet"
import Animated, { Extrapolate, interpolate, useAnimatedStyle } from "react-native-reanimated"
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

    const [blurReady, setBlurReady] = useState(false)

    useEffect(() => {
        requestAnimationFrame(() => setBlurReady(true))
    }, [])

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

        const solidStyle = useAnimatedStyle(() => ({
            opacity: interpolate(animatedIndex.value, [-1, 0, 1], [1, 0, 1], Extrapolate.CLAMP),
        }))

        const containerAnimatedStyle = useAnimatedStyle(() => ({
            margin: interpolate(animatedIndex.value, [-1, 0, 1], [12, 12, 0], Extrapolate.CLAMP),
        }))

        return (
            <Animated.View style={[style, { borderRadius: 35, overflow: "hidden" }, containerAnimatedStyle]}>
                <Animated.View
                    style={[
                        StyleSheet.absoluteFillObject,
                        solidStyle,
                        { backgroundColor: vars.secondaryBackgroundColor },
                    ]}
                />

                <Animated.View style={[StyleSheet.absoluteFillObject]}>
                    {blurReady && (
                        <GlassOrBlurView
                            borderColor={newUI ? vars.secondaryBorderColor : `${vars.secondaryBorderColor}50`}
                            backgroundColor={vars.secondaryBackgroundColor}
                            style={StyleSheet.absoluteFillObject}
                        />
                    )}
                </Animated.View>
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
            <BottomSheetView style={{ flex: 1, padding: 25 }}>
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
