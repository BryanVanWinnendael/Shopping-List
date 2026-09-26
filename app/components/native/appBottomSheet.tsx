import React, { forwardRef, useImperativeHandle, useMemo, useState } from "react"
import { StyleSheet, View } from "react-native"
import CommunityBottomSheet from "@expo/ui/community/bottom-sheet"
import { BottomSheet, Button, Host, RNHostView } from "@expo/ui/swift-ui"
import { presentationBackground, presentationDetents, presentationDragIndicator } from "@expo/ui/swift-ui/modifiers"

export type AppBottomSheetMethods = {
    close: () => void
    collapse: () => void
    dismiss: () => void
    expand: () => void
    forceClose: () => void
    present: () => void
    snapToIndex: (index: number) => void
    snapToPosition: (position: string | number) => void
}

export type BottomSheetBackgroundMode = "default" | "adaptive"

type Props = {
    children: React.ReactNode

    index?: number

    snapPoints?: (string | number)[]

    enablePanDownToClose?: boolean

    enableDynamicSizing?: boolean

    onClose?: () => void

    /**
     * "default"
     *   Uses the normal native sheet background.
     *
     * "adaptive"
     *   Collapsed = native system material
     *   Expanded = backgroundColor
     */
    backgroundMode?: BottomSheetBackgroundMode

    /**
     * Background used by the expanded detent.
     */
    backgroundColor?: string
}

type ProductionProps = {
    children: React.ReactNode

    index: number

    snapPoints: (string | number)[]

    enablePanDownToClose?: boolean

    onClose?: () => void

    backgroundMode?: BottomSheetBackgroundMode

    backgroundColor?: string
}

/**
 * Production/native implementation using Expo UI SwiftUI BottomSheet.
 */
const ProductionBottomSheet = forwardRef<AppBottomSheetMethods, ProductionProps>(
    (
        {
            children,
            index,
            snapPoints,
            enablePanDownToClose = false,
            onClose,
            backgroundMode = "default",
            backgroundColor,
        },
        ref
    ) => {
        const [isPresented, setIsPresented] = useState(index >= 0)

        const [currentIndex, setCurrentIndex] = useState(Math.max(index, 0))

        /**
         * Convert the React Native/RNGH-style snap points into
         * SwiftUI presentation detents.
         */
        const detents = useMemo(() => {
            return snapPoints.map((point) => {
                if (typeof point === "number") {
                    return {
                        height: point,
                    } as const
                }

                if (point.endsWith("%")) {
                    const percentage = Number(point.replace("%", ""))

                    return {
                        fraction: percentage / 100,
                    } as const
                }

                if (point === "large") {
                    return "large" as const
                }

                return "medium" as const
            })
        }, [snapPoints])

        const safeCurrentIndex = Math.min(Math.max(currentIndex, 0), Math.max(detents.length - 1, 0))

        const selectedDetent = detents[safeCurrentIndex]

        /**
         * Expo UI modifiers applied directly to the native
         * BottomSheet.
         */
        const modifiers = useMemo(() => {
            const result = [
                presentationDetents(detents as any, {
                    selection: selectedDetent as any,

                    onSelectionChange: (detent: any) => {
                        const nextIndex = detents.findIndex((item) => {
                            if (typeof item === "object" && typeof detent === "object") {
                                return (
                                    ("fraction" in item && "fraction" in detent && item.fraction === detent.fraction) ||
                                    ("height" in item && "height" in detent && item.height === detent.height)
                                )
                            }

                            return item === detent
                        })

                        if (nextIndex >= 0) {
                            setCurrentIndex(nextIndex)
                        }
                    },
                }),

                presentationDragIndicator("visible"),
            ]

            if (
                backgroundMode === "adaptive" &&
                backgroundColor &&
                detents.length > 0 &&
                safeCurrentIndex === detents.length - 1
            ) {
                result.push(presentationBackground(backgroundColor))
            }

            return result
        }, [backgroundMode, backgroundColor, detents, safeCurrentIndex, selectedDetent])

        useImperativeHandle(
            ref,
            () => ({
                close: () => {
                    setIsPresented(false)
                },

                dismiss: () => {
                    setIsPresented(false)
                },

                forceClose: () => {
                    setIsPresented(false)
                },

                present: () => {
                    setIsPresented(true)
                },

                collapse: () => {
                    if (detents.length === 0) {
                        return
                    }

                    setCurrentIndex(0)
                    setIsPresented(true)
                },

                expand: () => {
                    if (detents.length === 0) {
                        return
                    }

                    setCurrentIndex(detents.length - 1)
                    setIsPresented(true)
                },

                snapToIndex: (nextIndex: number) => {
                    if (nextIndex < 0) {
                        setIsPresented(false)
                        return
                    }

                    if (detents.length === 0) {
                        return
                    }

                    const safeIndex = Math.min(nextIndex, detents.length - 1)

                    setCurrentIndex(safeIndex)
                    setIsPresented(true)
                },

                snapToPosition: (position) => {
                    const nextIndex = snapPoints.findIndex((point) => point === position)

                    if (nextIndex < 0) {
                        return
                    }

                    setCurrentIndex(nextIndex)
                    setIsPresented(true)
                },
            }),
            [detents.length, snapPoints]
        )

        const handlePresentedChange = (presented: boolean) => {
            setIsPresented(presented)

            if (!presented) {
                onClose?.()
            }
        }

        return (
            <Host style={styles.host}>
                <BottomSheet
                    isPresented={isPresented}
                    onIsPresentedChange={handlePresentedChange}
                    anchor={<Button label="" onPress={() => {}} />}
                    modifiers={modifiers}
                >
                    <RNHostView>
                        <View style={styles.content}>{children}</View>
                    </RNHostView>
                </BottomSheet>
            </Host>
        )
    }
)

ProductionBottomSheet.displayName = "ProductionBottomSheet"

/**
 * Public AppBottomSheet.
 *
 * DEV:
 *   Uses Expo community implementation so it works in Expo Go.
 *
 * Production:
 *   Uses the native SwiftUI BottomSheet.
 */
const AppBottomSheet = forwardRef<AppBottomSheetMethods, Props>(
    (
        {
            children,
            index = -1,
            snapPoints = ["50%"],
            enablePanDownToClose = false,
            enableDynamicSizing = true,
            onClose,
            backgroundMode = "default",
            backgroundColor,
        },
        ref
    ) => {
        if (__DEV__) {
            return (
                <CommunityBottomSheet
                    ref={ref as any}
                    index={index}
                    snapPoints={snapPoints}
                    enablePanDownToClose={enablePanDownToClose}
                    enableDynamicSizing={enableDynamicSizing}
                    onClose={onClose}
                >
                    {children}
                </CommunityBottomSheet>
            )
        }

        return (
            <ProductionBottomSheet
                ref={ref}
                index={index}
                snapPoints={snapPoints}
                enablePanDownToClose={enablePanDownToClose}
                onClose={onClose}
                backgroundMode={backgroundMode}
                backgroundColor={backgroundColor}
            >
                {children}
            </ProductionBottomSheet>
        )
    }
)

AppBottomSheet.displayName = "AppBottomSheet"

const styles = StyleSheet.create({
    host: {
        position: "absolute",
        width: 0,
        height: 0,
    },
    content: {
        flex: 1,
        backgroundColor: "transparent",
    },
})

export default AppBottomSheet
