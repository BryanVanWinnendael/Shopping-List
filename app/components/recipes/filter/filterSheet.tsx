import {
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  Switch,
  TextInput,
} from "react-native"
import { useSettings } from "@/stores/useSettings"
import { getBackgroundColor, getBorderColor, getTextColor } from "@/lib/theme"
import { MealTypeSegment } from "../mealTypeSegment"
import { MealType } from "@/types"
import { CountriesSelector } from "./countriesSelector"
import { useRecipes } from "@/stores/useRecipes"
import { PressableScale } from "pressto"

export function FilterSheet() {
  const { theme, aColor } = useSettings()
  const { activeFilter, setActiveFilter } = useRecipes()

  const backgroundColor = getBackgroundColor(theme)
  const textColor = getTextColor(theme)
  const borderColor = getBorderColor(theme)

  const handleChangeMealType = (type: MealType) => {
    setActiveFilter({ ...activeFilter, mealType: type })
  }

  const handleChangeTime = (timeStr: string) => {
    const time = timeStr.trim() === "" ? null : parseInt(timeStr, 10)
    setActiveFilter({ ...activeFilter, time })
  }

  const clearFilters = () => {
    setActiveFilter({
      mealType: "Any",
      public: true,
      country: "Any",
      time: null,
    })
  }

  return (
    <View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: getTextColor(theme),
          marginBottom: 16,
        }}
      >
        Filter Recipes
      </Text>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ gap: 12 }}>
          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                color: textColor,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              Meal Type
            </Text>
            <MealTypeSegment
              theme={theme}
              value={activeFilter?.mealType || "Any"}
              onChange={handleChangeMealType}
            />
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                color: textColor,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              Public
            </Text>
            <Switch
              value={activeFilter?.public}
              onValueChange={(value) =>
                setActiveFilter({ ...activeFilter, public: value })
              }
              trackColor={{ false: "#767577", true: aColor }}
              ios_backgroundColor="#767577"
              thumbColor={activeFilter.public ? "#fff" : "#f4f3f4"}
            />
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                color: textColor,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              Country
            </Text>
            <CountriesSelector />
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                color: textColor,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              Max Time (minutes)
            </Text>
            <TextInput
              keyboardType="numeric"
              placeholder="e.g. 30"
              placeholderTextColor="#aaa"
              value={activeFilter?.time?.toString() || ""}
              onChangeText={handleChangeTime}
              returnKeyType="done"
              style={{
                height: 44,
                borderWidth: 1,
                borderColor: borderColor,
                borderRadius: 12,
                paddingHorizontal: 12,
                backgroundColor: backgroundColor,
                color: textColor,
              }}
            />
          </View>
          <View style={{ marginBottom: 12 }}>
            <PressableScale
              style={{
                backgroundColor: aColor,
                padding: 14,
                borderRadius: 12,
                alignItems: "center",
                marginTop: 16,
              }}
              onPress={clearFilters}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>Clear</Text>
            </PressableScale>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}
