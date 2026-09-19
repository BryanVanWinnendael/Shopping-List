import React, { ElementRef, forwardRef, useImperativeHandle, useMemo, useState } from "react"
import { View } from "react-native"

import CommunityBottomSheet from "@expo/ui/community/bottom-sheet"

import { BottomSheet as SwiftBottomSheet, Group, Host } from "@expo/ui/swift-ui"

import { presentationBackground, presentationDetents, presentationDragIndicator } from "@expo/ui/swift-ui/modifiers"

export type BottomSheetRef = ElementRef<typeof CommunityBottomSheet>

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
     *   Collapsed = native Liquid Glass / system material
     *   Expanded = backgroundColor
     */
    backgroundMode?: BottomSheetBackgroundMode

    /**
     * Background used by the expanded detent.
     *
     * Pass vars.backgroundColor from your theme.
     */
    backgroundColor?: string
}

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
        /*
         * DEV
         *
         * Keep using the community implementation in Expo Go.
         */
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

        /*
         * BUILD / PRODUCTION
         *
         * Use the native SwiftUI implementation.
         */
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

type ProductionProps = {
    children: React.ReactNode

    index: number

    snapPoints: (string | number)[]

    enablePanDownToClose: boolean

    onClose?: () => void

    backgroundMode: BottomSheetBackgroundMode

    backgroundColor?: string
}

const ProductionBottomSheet = forwardRef<AppBottomSheetMethods, ProductionProps>(
    ({ children, index, snapPoints, onClose, backgroundMode, backgroundColor }, ref) => {
        const [isPresented, setIsPresented] = useState(index >= 0)

        /*
         * We represent the selected detent by its index.
         *
         * Example:
         *
         * ["55%", "85%"]
         *
         * 0 = 55%
         * 1 = 85%
         */
        const [currentIndex, setCurrentIndex] = useState(Math.max(index, 0))

        /*
         * Convert React Native/Gorhom-style snap points
         * into SwiftUI presentation detents.
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

                /*
                 * Fallback for values such as "medium"/"large".
                 */
                if (point === "large") {
                    return "large" as const
                }

                return "medium" as const
            })
        }, [snapPoints])

        /*
         * SwiftUI requires the actual PresentationDetent
         * as the selection value.
         *
         * We use the same object from the detents array.
         */
        const selectedDetent = detents[Math.min(currentIndex, Math.max(detents.length - 1, 0))]

        /*
         * Adaptive background:
         *
         * collapsed:
         *   no presentationBackground modifier
         *
         *   -> iOS keeps the native sheet material / glass
         *
         * expanded:
         *   presentationBackground(backgroundColor)
         *
         *   -> the entire native sheet becomes your app color
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

            /*
             * Default mode:
             *
             * Do not override the native sheet background.
             */
            if (backgroundMode === "default") {
                return result
            }

            /*
             * Adaptive mode:
             *
             * Only the LAST detent receives the app background.
             *
             * At the smaller detent we deliberately do NOT add
             * presentationBackground(), allowing iOS to render
             * its native translucent sheet surface.
             */
            const isExpanded = currentIndex >= detents.length - 1

            if (isExpanded && backgroundColor) {
                result.push(presentationBackground(backgroundColor))
            }

            return result
        }, [backgroundMode, backgroundColor, currentIndex, detents, selectedDetent])

        useImperativeHandle(
            ref,
            () => ({
                close: () => {
                    setIsPresented(false)
                },

                collapse: () => {
                    setCurrentIndex(0)
                    setIsPresented(true)
                },

                dismiss: () => {
                    setIsPresented(false)
                },

                expand: () => {
                    setCurrentIndex(Math.max(detents.length - 1, 0))

                    setIsPresented(true)
                },

                forceClose: () => {
                    setIsPresented(false)
                },

                present: () => {
                    setIsPresented(true)
                },

                snapToIndex: (nextIndex: number) => {
                    if (nextIndex < 0) {
                        setIsPresented(false)
                        return
                    }

                    const safeIndex = Math.min(nextIndex, Math.max(detents.length - 1, 0))

                    setCurrentIndex(safeIndex)
                    setIsPresented(true)
                },

                snapToPosition: (position) => {
                    let nextIndex = currentIndex

                    if (typeof position === "number") {
                        const indexForHeight = snapPoints.findIndex((point) => point === position)

                        if (indexForHeight >= 0) {
                            nextIndex = indexForHeight
                        }
                    } else {
                        const indexForString = snapPoints.findIndex((point) => point === position)

                        if (indexForString >= 0) {
                            nextIndex = indexForString
                        }
                    }

                    setCurrentIndex(nextIndex)
                    setIsPresented(true)
                },
            }),
            [currentIndex, detents.length, snapPoints]
        )

        const handlePresentedChange = (presented: boolean) => {
            setIsPresented(presented)

            if (!presented) {
                onClose?.()
            }
        }

        return (
            <Host
                style={{
                    position: "absolute",
                    width: 0,
                    height: 0,
                }}
            >
                <SwiftBottomSheet isPresented={isPresented} onIsPresentedChange={handlePresentedChange}>
                    <Group modifiers={modifiers}>
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: "transparent",
                            }}
                        >
                            {children}
                        </View>
                    </Group>
                </SwiftBottomSheet>
            </Host>
        )
    }
)

ProductionBottomSheet.displayName = "ProductionBottomSheet"

export default AppBottomSheet
