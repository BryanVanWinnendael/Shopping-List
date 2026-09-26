import React, { forwardRef, useImperativeHandle, useMemo, useState } from "react"
import { StyleSheet, View } from "react-native"
import CommunityBottomSheet from "@expo/ui/community/bottom-sheet"
import { BottomSheet, Group, Host, RNHostView } from "@expo/ui/swift-ui"
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
    backgroundMode?: BottomSheetBackgroundMode
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
         * Convert React Native/Gorhom-style snap points
         * into SwiftUI presentation detents.
         */
        const detents = useMemo(() => {
            return snapPoints
                .map((point) => {
                    if (typeof point === "number") {
                        return {
                            height: point,
                        } as const
                    }

                    if (point.endsWith("%")) {
                        const percentage = Number(point.replace("%", ""))

                        if (Number.isFinite(percentage) && percentage > 0) {
                            return {
                                fraction: percentage / 100,
                            } as const
                        }

                        return null
                    }

                    if (point === "medium") {
                        return "medium" as const
                    }

                    if (point === "large") {
                        return "large" as const
                    }

                    return null
                })
                .filter(
                    (point): point is { height: number } | { fraction: number } | "medium" | "large" => point !== null
                )
        }, [snapPoints])

        const safeCurrentIndex = detents.length === 0 ? 0 : Math.min(Math.max(currentIndex, 0), detents.length - 1)

        const selectedDetent = detents[safeCurrentIndex]

        /**
         * Whether the current detent is the collapsed/lowest one.
         *
         * We deliberately DON'T apply presentationBackground
         * to the collapsed state so iOS can use its native
         * Liquid Glass sheet appearance.
         */
        const isCollapsed = safeCurrentIndex === 0

        const modifiers = useMemo(() => {
            const result: any[] = [
                presentationDetents(detents as any, {
                    selection: selectedDetent as any,

                    onSelectionChange: (detent: any) => {
                        const nextIndex = detents.findIndex((item) => {
                            if (typeof item === "object" && typeof detent === "object") {
                                if ("fraction" in item && "fraction" in detent) {
                                    return item.fraction === detent.fraction
                                }

                                if ("height" in item && "height" in detent) {
                                    return item.height === detent.height
                                }
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

            /**
             * IMPORTANT:
             *
             * presentationBackground opts the sheet out of
             * the native translucent/Liquid Glass material.
             *
             * Therefore:
             * - default -> native Liquid Glass
             * - adaptive + collapsed -> native Liquid Glass
             * - adaptive + expanded -> your app background
             */
            if (backgroundMode === "adaptive" && backgroundColor && !isCollapsed) {
                result.push(presentationBackground(backgroundColor))
            }

            return result
        }, [backgroundMode, backgroundColor, detents, selectedDetent, isCollapsed])

        useImperativeHandle(
            ref,
            () => ({
                present: () => {
                    setIsPresented(true)
                },

                close: () => {
                    setIsPresented(false)
                },

                dismiss: () => {
                    setIsPresented(false)
                },

                forceClose: () => {
                    setIsPresented(false)
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
                <BottomSheet isPresented={isPresented} onIsPresentedChange={handlePresentedChange}>
                    <Group modifiers={modifiers}>
                        <RNHostView>
                            <View style={styles.content}>{children}</View>
                        </RNHostView>
                    </Group>
                </BottomSheet>
            </Host>
        )
    }
)

ProductionBottomSheet.displayName = "ProductionBottomSheet"

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
        flex: 1,
        width: "100%",
        height: "100%",
    },

    content: {
        backgroundColor: "transparent",
        width: "100%",
    },
})

export default AppBottomSheet
