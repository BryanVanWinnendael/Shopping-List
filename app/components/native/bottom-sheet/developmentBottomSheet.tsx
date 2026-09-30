import { forwardRef, useState } from "react"
import { StyleSheet, View } from "react-native"
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
        },
        ref
    ) => {
        const [currentIndex, setCurrentIndex] = useState(Math.max(index, 0))

        const safeCurrentIndex = Math.min(Math.max(currentIndex, 0), Math.max(snapPoints.length - 1, 0))

        const currentSnapPoint = snapPoints[safeCurrentIndex]

        const shouldUseCustomBackground =
            backgroundMode === "adaptive" && !!backgroundColor && currentSnapPoint === snapPoints[snapPoints.length - 1]

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
                    backgroundColor: shouldUseCustomBackground ? backgroundColor : "transparent",
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

    children: {
        flex: 1,
        paddingTop: 12,
    },
})

export default DevelopmentBottomSheet
