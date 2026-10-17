import { forwardRef, useCallback, useMemo, useRef, useState } from "react"
import { LayoutChangeEvent, StyleSheet, View, useWindowDimensions } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import CommunityBottomSheet from "@expo/ui/community/bottom-sheet"
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue } from "react-native-reanimated"
import type { BottomSheetProps, BottomSheetRef } from "./appBottomSheet"

// The sheet's own material stays untouched so liquid glass keeps showing
// through; the app background is painted on a backdrop layer that fades in.
const GLASS_BACKDROP = "rgba(0,0,0,0)"

// The native sheet surface is taller than its React content: it reserves a
// grabber strip on top and the home-indicator inset at the bottom. The backdrop
// bleeds into the top strip (fixed height) and the bottom inset (measured), so
// the solid background reaches the real edges of the sheet.
const NATIVE_TOP_INSET = 20

// How close to a snap point the content must sit before it counts as settled.
const SETTLED_TOLERANCE = 12

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1)

const snapPointToHeight = (point: string | number, windowHeight: number) => {
    if (typeof point === "number") return point
    if (point.endsWith("%")) return (Number(point.replace("%", "")) / 100) * windowHeight
    if (point === "large") return windowHeight

    return windowHeight * 0.5
}

const DevelopmentBottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
    (
        {
            children,
            index = -1,
            snapPoints = [],
            enablePanDownToClose = false,
            enableDynamicSizing = false,
            onClose,
            backgroundMode = "default",
            backgroundColor,
        },
        ref
    ) => {
        const [currentIndex, setCurrentIndex] = useState(Math.max(index, 0))

        const insets = useSafeAreaInsets()
        const { height: windowHeight } = useWindowDimensions()

        const isSolidAtRest = backgroundMode === "adaptive" && !!backgroundColor

        // The gap in points between the smallest and the largest snap point.
        // This is the same amount the content grows by, because the grabber
        // strip above it never changes size between detents.
        const span = useMemo(() => {
            if (snapPoints.length < 2) return 0

            const low = snapPointToHeight(snapPoints[0], windowHeight)
            const high = snapPointToHeight(snapPoints[snapPoints.length - 1], windowHeight)

            return high - low
        }, [snapPoints, windowHeight])

        // 0 = liquid glass, 1 = solid app background.
        const backdrop = useSharedValue(isSolidAtRest && currentIndex === snapPoints.length - 1 ? 1 : 0)

        // Measured content height at whichever snap point we last came to rest
        // on. The opposite end of the scale is derived from it, so the fade is
        // calibrated in real pixels instead of guessed.
        const anchor = useRef<{ height: number; isLow: boolean } | null>(null)

        // @expo/ui only reports detent changes, never the position in between,
        // so the drag itself is read from the hosted view resizing every frame.
        const handleLayout = useCallback(
            ({ nativeEvent }: LayoutChangeEvent) => {
                const height = nativeEvent.layout.height
                const lastIndex = snapPoints.length - 1
                const isLow = currentIndex === 0
                const isHigh = currentIndex === lastIndex

                if (
                    (isLow || isHigh) &&
                    Math.abs(height - snapPointToHeight(snapPoints[currentIndex], windowHeight)) <= SETTLED_TOLERANCE
                ) {
                    anchor.current = { height, isLow }
                }

                const settled = anchor.current

                if (!settled || span <= 0) {
                    backdrop.value = isHigh ? 1 : 0
                    return
                }

                const low = settled.isLow ? settled.height : settled.height - span

                backdrop.value = clamp01((height - low) / span)
            },
            [backdrop, currentIndex, snapPoints, span, windowHeight]
        )

        const backdropStyle = useAnimatedStyle(() => ({
            backgroundColor: backgroundColor
                ? interpolateColor(backdrop.value, [0, 1], [GLASS_BACKDROP, backgroundColor])
                : GLASS_BACKDROP,
        }))

        return (
            <CommunityBottomSheet
                ref={ref}
                index={index}
                snapPoints={snapPoints}
                enablePanDownToClose={enablePanDownToClose}
                enableDynamicSizing={enableDynamicSizing}
                onClose={onClose}
                onChange={setCurrentIndex}
                backgroundStyle={{ backgroundColor: GLASS_BACKDROP }}
            >
                <View style={styles.content} onLayout={handleLayout}>
                    <Animated.View
                        style={[styles.backdrop, { bottom: -insets.bottom }, backdropStyle]}
                        pointerEvents="none"
                    />

                    <View style={styles.children}>{children}</View>
                </View>
            </CommunityBottomSheet>
        )
    }
)

DevelopmentBottomSheet.displayName = "DevelopmentBottomSheet"

const styles = StyleSheet.create({
    content: {
        flex: 1,
        backgroundColor: "transparent",
        overflow: "visible",
    },

    backdrop: {
        position: "absolute",
        top: -NATIVE_TOP_INSET,
        left: 0,
        right: 0,
    },

    children: {
        flex: 1,
        paddingTop: 12,
    },
})

export default DevelopmentBottomSheet
