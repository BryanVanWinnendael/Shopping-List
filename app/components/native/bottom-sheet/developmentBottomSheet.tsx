import { forwardRef, useEffect, useRef, useState } from "react"
import { Animated, StyleSheet, View } from "react-native"
import CommunityBottomSheet from "@expo/ui/community/bottom-sheet"
import type { BottomSheetProps, BottomSheetRef } from "./appBottomSheet"

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
            appearance = "light",
        },
        ref
    ) => {
        const [currentIndex, setCurrentIndex] = useState(Math.max(index, 0))

        const shouldShowCustomBackground =
            backgroundMode === "adaptive" &&
            !!backgroundColor &&
            snapPoints.length > 0 &&
            currentIndex === snapPoints.length - 1

        const backgroundOpacity = useRef(new Animated.Value(shouldShowCustomBackground ? 1 : 0)).current

        useEffect(() => {
            Animated.timing(backgroundOpacity, {
                toValue: shouldShowCustomBackground ? 1 : 0,
                duration: 600,
                useNativeDriver: true,
            }).start()
        }, [backgroundOpacity, shouldShowCustomBackground])

        const liquidGlassColor = appearance === "dark" ? "rgba(28, 28, 30, 0.1)" : "rgba(242, 242, 247, 0.1)"
        const sheetBackgroundColor = shouldShowCustomBackground
            ? (backgroundColor ?? liquidGlassColor)
            : liquidGlassColor

        return (
            <CommunityBottomSheet
                ref={ref}
                index={index}
                snapPoints={snapPoints}
                enablePanDownToClose={enablePanDownToClose}
                enableDynamicSizing={enableDynamicSizing}
                onClose={onClose}
                onChange={setCurrentIndex}
                backgroundStyle={{
                    backgroundColor: sheetBackgroundColor,
                }}
            >
                <View style={styles.content}>
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
    },

    backgroundOverlay: {
        ...StyleSheet.absoluteFill,
    },

    children: {
        flex: 1,
        paddingTop: 12,
    },

    footer: {
        backgroundColor: "transparent",
    },
})

export default DevelopmentBottomSheet
