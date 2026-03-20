import { useState, useRef, useCallback } from "react"
import { Text, View } from "react-native"
import { useSettings } from "@/stores/useSettings"
import { ChevronDown, ListFilter } from "lucide-react-native"
import { BlurView } from "expo-blur"
import BottomSheet from "@gorhom/bottom-sheet"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  interpolate,
  useAnimatedProps,
} from "react-native-reanimated"
import * as Haptics from "expo-haptics"
import {
  getBlurSecondaryBackgroundColor,
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import { FilterSheet } from "./filterSheet"
import { CustomBottomSheet } from "../../customBottomSheet"
import { PressableScale } from "pressto"
import { GlassOrBlurView } from "@/components/glassOrBlurView"
import { useRecipes } from "@/stores/useRecipes"

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

export function FilterButton() {
  const { theme, aColor, newUI } = useSettings()
  const { activeFilter, setFilter } = useRecipes()
  const width = useSharedValue(48)
  const blurIntensity = useSharedValue(50)
  const snapPoints = ["30%"]

  const bottomSheetRef = useRef<BottomSheet>(null)

  const [expanded, setExpanded] = useState(false)

  const textColor = getTextColor(theme)
  const borderColor = getBorderColor(theme)
  const blurSecondaryBackgroundColor = getBlurSecondaryBackgroundColor(theme)
  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const bgTint =
    theme === "light" ? "systemThickMaterialLight" : "systemThickMaterialDark"

  const getFilterButtonText = () => {
    if (!activeFilter) return "Filter"
    const parts = []
    if (activeFilter.mealType && activeFilter.mealType !== "Any") {
      parts.push(activeFilter.mealType)
    }
    if (activeFilter.public !== undefined && !activeFilter.public) {
      parts.push("My Recipes")
    }
    if (activeFilter.country && activeFilter.country !== "Any") {
      parts.push(activeFilter.country)
    }
    if (activeFilter.time !== null && activeFilter.time !== undefined) {
      parts.push(`≤ ${activeFilter.time} min`)
    }
    if (parts.length === 0) return "All"
    return parts.join(", ")
  }

  const animatedStyle = useAnimatedStyle(() => {
    const borderRadius = interpolate(width.value, [48, 220], [24, 200])
    return {
      width: width.value,
      borderRadius,
    }
  })

  const animatedBlurProps = useAnimatedProps(() => ({
    intensity: blurIntensity.value,
  }))

  const onPress = () => {
    setExpanded((prev) => !prev)

    if (!expanded) {
      width.value = withSequence(
        withTiming(220, { duration: 180 }),
        withTiming(200, { duration: 220 }),
      )
      blurIntensity.value = withSequence(
        withTiming(100, { duration: 180 }),
        withTiming(50, { duration: 300 }),
      )
      setFilter(true)
    } else {
      width.value = withSequence(
        withTiming(40, { duration: 150 }),
        withTiming(48, { duration: 150 }),
      )
      blurIntensity.value = withSequence(
        withTiming(80, { duration: 100 }),
        withTiming(50, { duration: 150 }),
      )
      setFilter(false)
    }
  }

  const openSheet = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    bottomSheetRef.current?.expand()
  }, [])

  const closeSheet = useCallback(() => {
    bottomSheetRef.current?.close()
  }, [])

  const Content = (
    <PressableScale
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {expanded && (
        <PressableScale
          onPress={openSheet}
          style={{
            paddingRight: 12,
            alignItems: "flex-start",
          }}
        >
          <Text style={{ color: textColor }}>Filtered by</Text>
          <View
            style={{
              flexDirection: "row",
              gap: 6,
              justifyContent: "center",
              alignItems: "center",
              maxWidth: 100,
            }}
          >
            <Text
              style={{
                color: aColor,
                flexShrink: 1,
              }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {getFilterButtonText()}
            </Text>
            <ChevronDown color={aColor} size={16} />
          </View>
        </PressableScale>
      )}

      <View
        style={{
          backgroundColor: expanded ? aColor : "transparent",
          padding: expanded ? 8 : 0,
          borderRadius: 20,
          paddingHorizontal: expanded ? 20 : 0,
        }}
      >
        <ListFilter size={22} color={textColor} />
      </View>
    </PressableScale>
  )

  return (
    <>
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 30,
            right: 80,
            overflow: "hidden",
            width: 48,
            borderWidth: newUI ? 0 : 1,
            borderColor,
            height: 48,
            zIndex: 1,
          },
          animatedStyle,
        ]}
      >
        {newUI ? (
          <GlassOrBlurView
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingHorizontal: expanded ? 6 : 12,
              height: 48,
            }}
            glassBackgroundColor={secondaryBackgroundColor}
            givenGlassBorderColor={secondaryBackgroundColor}
            blurBackground={blurSecondaryBackgroundColor}
            givenBlurBorderColor={blurSecondaryBackgroundColor}
            borderRadius={999}
          >
            {Content}
          </GlassOrBlurView>
        ) : (
          <AnimatedBlurView
            animatedProps={animatedBlurProps}
            tint={bgTint}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              paddingHorizontal: expanded ? 6 : 12,
              height: 48,
            }}
          >
            {Content}
          </AnimatedBlurView>
        )}
      </Animated.View>

      <CustomBottomSheet
        backgroundMode="glass"
        sheetRef={bottomSheetRef}
        onClose={closeSheet}
        snapPoints={snapPoints}
      >
        <FilterSheet />
      </CustomBottomSheet>
    </>
  )
}
