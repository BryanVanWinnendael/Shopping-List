import { useMemo, ReactNode, RefObject, useEffect, useState } from "react"
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native"
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackgroundProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet"
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated"
import { GlassOrBlurView } from "./glassOrBlurView"
import { useSettings } from "@/stores/useSettings"
import { getSecondaryBackgroundColor } from "@/lib/theme"

type Props = {
  sheetRef: RefObject<BottomSheet | null>
  onClose: () => void
  snapPoints?: string[]
  children: ReactNode
  bottomSheetViewStyle?: StyleProp<ViewStyle>
  tintColor?: string
  backgroundMode?: "glass" | "fade"
}

export function CustomBottomSheet({
  sheetRef,
  snapPoints = ["50%", "85%"],
  onClose,
  children,
  backgroundMode = "fade",
}: Props) {
  const { theme } = useSettings()
  const memoSnapPoints = useMemo(() => snapPoints, [])

  const [blurReady, setBlurReady] = useState(false)

  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)

  useEffect(() => {
    requestAnimationFrame(() => setBlurReady(true))
  }, [])

  const SheetBackground = ({
    style,
    animatedIndex,
  }: BottomSheetBackgroundProps) => {
    if (backgroundMode === "glass") {
      return (
        <GlassOrBlurView
          glassBackgroundColor={secondaryBackgroundColor}
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
      opacity: interpolate(
        animatedIndex.value,
        [-1, 0, 1],
        [1, 0, 1],
        Extrapolate.CLAMP,
      ),
    }))

    const containerAnimatedStyle = useAnimatedStyle(() => ({
      margin: interpolate(
        animatedIndex.value,
        [-1, 0, 1],
        [12, 12, 0],
        Extrapolate.CLAMP,
      ),
    }))

    return (
      <Animated.View
        style={[
          style,
          { borderRadius: 35, overflow: "hidden" },
          containerAnimatedStyle,
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            solidStyle,
            { backgroundColor: secondaryBackgroundColor },
          ]}
        />

        <Animated.View style={[StyleSheet.absoluteFillObject]}>
          {blurReady && (
            <GlassOrBlurView
              glassBackgroundColor={secondaryBackgroundColor}
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
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
        />
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
              borderRadius: 2,
              backgroundColor: "#666",
            }}
          />
        </View>

        {children}
      </BottomSheetView>
    </BottomSheet>
  )
}
