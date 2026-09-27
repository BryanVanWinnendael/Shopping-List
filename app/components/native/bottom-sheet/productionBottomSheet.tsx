import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react"
import { Animated, StyleSheet, View } from "react-native"
import { BottomSheet, Button, Group, Host, RNHostView } from "@expo/ui/swift-ui"
import { presentationDetents, presentationDragIndicator } from "@expo/ui/swift-ui/modifiers"
import type { BottomSheetProps, BottomSheetRef } from "./appBottomSheet"

type Props = BottomSheetProps

const ProductionBottomSheet = forwardRef<BottomSheetRef, Props>(
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
        const [isPresented, setIsPresented] = useState(index >= 0)
        const [currentIndex, setCurrentIndex] = useState(Math.max(index, 0))

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

        const shouldShowCustomBackground =
            backgroundMode === "adaptive" &&
            !!backgroundColor &&
            detents.length > 0 &&
            safeCurrentIndex === detents.length - 1

        const backgroundOpacity = useRef(new Animated.Value(shouldShowCustomBackground ? 1 : 0)).current

        useEffect(() => {
            Animated.timing(backgroundOpacity, {
                toValue: shouldShowCustomBackground ? 1 : 0,
                duration: 600,
                useNativeDriver: true,
            }).start()
        }, [backgroundOpacity, shouldShowCustomBackground])

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

                snapToPosition: (position: string | number) => {
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
            <Host style={styles.host} colorScheme={appearance}>
                <BottomSheet
                    isPresented={isPresented}
                    onIsPresentedChange={handlePresentedChange}
                    anchor={<Button label="" onPress={() => {}} />}
                >
                    <Group modifiers={modifiers}>
                        <RNHostView>
                            <View style={styles.content}>
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

export default ProductionBottomSheet
