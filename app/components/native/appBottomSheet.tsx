import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { Animated, StyleSheet, View } from "react-native"

import CommunityBottomSheet from "@expo/ui/community/bottom-sheet"

import { BottomSheet, Button, Group, Host, RNHostView } from "@expo/ui/swift-ui"

import { presentationDetents, presentationDragIndicator } from "@expo/ui/swift-ui/modifiers"

export type BottomSheetRef = {
    close: () => void
    collapse: () => void
    dismiss: () => void
    expand: () => void
    forceClose: () => void
    present: () => void
    snapToIndex: (index: number) => void
    snapToPosition: (position: string | number) => void
}

type Props = {
    children: React.ReactNode
    index?: number
    snapPoints?: (string | number)[]
    enablePanDownToClose?: boolean
    enableDynamicSizing?: boolean
    onClose?: () => void
    backgroundMode?: "default" | "adaptive"
    backgroundColor?: string
}

type ProductionProps = Props & {
    index: number
    snapPoints: (string | number)[]
}

const AppBottomSheet = forwardRef<BottomSheetRef, Props>(
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
        if (__DEV__) {
            return (
                <CommunityBottomSheet
                    ref={ref}
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
                enableDynamicSizing={enableDynamicSizing}
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

const ProductionBottomSheet = forwardRef<BottomSheetRef, ProductionProps>(
    (
        {
            children,
            index,
            snapPoints,
            enablePanDownToClose = false,
            enableDynamicSizing = false,
            onClose,
            backgroundMode = "default",
            backgroundColor,
        },
        ref
    ) => {
        const [isPresented, setIsPresented] = useState(index >= 0)

        const [currentIndex, setCurrentIndex] = useState(Math.max(index, 0))

        /**
         * Convert RN-style snap points into SwiftUI presentation detents.
         *
         * Examples:
         * "55%"   -> { fraction: 0.55 }
         * "75%"   -> { fraction: 0.75 }
         * "large" -> "large"
         * 400     -> { height: 400 }
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
         * ---------------------------------------------------------
         * BACKGROUND TRANSITION
         * ---------------------------------------------------------
         *
         * 0 = native Liquid Glass visible
         * 1 = custom background visible
         */
        const backgroundOpacity = useRef(
            new Animated.Value(
                backgroundMode === "adaptive" &&
                    !!backgroundColor &&
                    detents.length > 0 &&
                    safeCurrentIndex === detents.length - 1
                    ? 1
                    : 0
            )
        ).current

        const shouldShowCustomBackground =
            backgroundMode === "adaptive" &&
            !!backgroundColor &&
            detents.length > 0 &&
            safeCurrentIndex === detents.length - 1

        useEffect(() => {
            Animated.timing(backgroundOpacity, {
                toValue: shouldShowCustomBackground ? 1 : 0,
                duration: 600,
                useNativeDriver: true,
            }).start()
        }, [backgroundOpacity, shouldShowCustomBackground])

        /**
         * ---------------------------------------------------------
         * SWIFTUI PRESENTATION MODIFIERS
         * ---------------------------------------------------------
         *
         * We intentionally don't use presentationBackground().
         *
         * This keeps the native Liquid Glass underneath the
         * animated React Native background.
         */
        const modifiers = useMemo(() => {
            return [
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
        }, [detents, selectedDetent])

        /**
         * ---------------------------------------------------------
         * IMPERATIVE API
         * ---------------------------------------------------------
         */
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
                    if (detents.length === 0) return

                    setCurrentIndex(0)
                    setIsPresented(true)
                },

                expand: () => {
                    if (detents.length === 0) return

                    setCurrentIndex(detents.length - 1)
                    setIsPresented(true)
                },

                snapToIndex: (nextIndex: number) => {
                    if (nextIndex < 0) {
                        setIsPresented(false)
                        return
                    }

                    if (detents.length === 0) return

                    const safeIndex = Math.min(nextIndex, detents.length - 1)

                    setCurrentIndex(safeIndex)
                    setIsPresented(true)
                },

                snapToPosition: (position: string | number) => {
                    const nextIndex = snapPoints.findIndex((point) => point === position)

                    if (nextIndex < 0) return

                    setCurrentIndex(nextIndex)
                    setIsPresented(true)
                },
            }),
            [detents.length, snapPoints]
        )

        /**
         * ---------------------------------------------------------
         * PRESENTATION STATE
         * ---------------------------------------------------------
         */
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
                >
                    <Group modifiers={modifiers}>
                        <RNHostView>
                            <View style={styles.content}>
                                {/**
                                 * Full-sheet background.
                                 *
                                 * This sits above the native Liquid Glass
                                 * and fades in/out smoothly.
                                 */}
                                {backgroundColor && (
                                    <Animated.View
                                        pointerEvents="none"
                                        style={[
                                            styles.backgroundOverlay,
                                            {
                                                backgroundColor,
                                                opacity: backgroundOpacity,
                                            },
                                        ]}
                                    />
                                )}

                                {/**
                                 * Only the actual content gets top padding.
                                 *
                                 * The background remains completely
                                 * edge-to-edge.
                                 */}
                                <View style={styles.children}>{children}</View>
                            </View>
                        </RNHostView>
                    </Group>
                </BottomSheet>
            </Host>
        )
    }
)

ProductionBottomSheet.displayName = "ProductionBottomSheet"

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
    backgroundOverlay: {
        ...StyleSheet.absoluteFill,
    },
    children: {
        flex: 1,
        paddingTop: 12,
    },
})

export default AppBottomSheet
