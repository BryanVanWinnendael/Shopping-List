import React, { forwardRef, useImperativeHandle, useMemo, useState } from "react"
import { StyleSheet, View } from "react-native"
import { BottomSheet, Button, Group, Host, RNHostView } from "@expo/ui/swift-ui"
import { presentationBackground, presentationDetents, presentationDragIndicator } from "@expo/ui/swift-ui/modifiers"
import type { BottomSheetProps, BottomSheetRef } from "./appBottomSheet"

const ProductionBottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
    ({ children, index = -1, snapPoints = [], onClose, backgroundMode = "default", backgroundColor }, ref) => {
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

        /*
         * Only use the custom application background when the
         * sheet is actually at the "large" detent.
         *
         * Example:
         *
         * ["25%"]
         * -> Liquid Glass
         *
         * ["25%", "large"]
         * -> 25% = Liquid Glass
         * -> large = custom background
         */
        const currentSnapPoint = snapPoints[safeCurrentIndex]

        const shouldUseCustomBackground =
            backgroundMode === "adaptive" && !!backgroundColor && currentSnapPoint === "large"

        const modifiers = useMemo(() => {
            const nextModifiers = [
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

            if (shouldUseCustomBackground && backgroundColor) {
                nextModifiers.push(presentationBackground(backgroundColor))
            }

            return nextModifiers
        }, [detents, selectedDetent, shouldUseCustomBackground, backgroundColor])

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
    children: {
        flex: 1,
        paddingTop: 12,
    },
})

export default ProductionBottomSheet
