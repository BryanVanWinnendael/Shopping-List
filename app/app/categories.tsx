import { ScrollView, Text, ActivityIndicator, View } from "react-native"
import { useSettings } from "@/stores/useSettings"
import {
  getBackgroundColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import { updateCategory } from "@/lib/firebase"
import { Categories as CategoriesType, ItemType } from "@/types"
import { useRef, useState, useCallback } from "react"
import BottomSheet from "@gorhom/bottom-sheet"
import { useHeaderHeight } from "@react-navigation/elements"
import { trainModel } from "@/lib/model"
import { CATEGORY_ORDER } from "@/lib/constants"
import ItemEdit from "@/components/list/itemEdit"
import { CustomBottomSheet } from "@/components/customBottomSheet"
import { PressableScale } from "pressto"
import { useInteractions } from "@/stores/useInteractions"

export default function Categories() {
  const { theme, aColor } = useSettings()
  const { setError, items } = useInteractions()
  const headerHeight = useHeaderHeight()

  const bottomSheetRef = useRef<BottomSheet>(null)
  const scrollRef = useRef<ScrollView>(null)

  const [training, setTraining] = useState<boolean>(false)
  const [selectedItem, setSelectedItem] = useState<ItemType | null>(null)

  const backgroundColor = getBackgroundColor(theme)
  const textColor = getTextColor(theme)

  const openBottomSheet = (item: ItemType) => {
    setSelectedItem(item)
    bottomSheetRef.current?.expand()
  }

  const closeSheet = useCallback(() => {
    setSelectedItem(null)
    bottomSheetRef.current?.close()
  }, [])

  const handleChangeCategory = async (category: CategoriesType) => {
    if (!selectedItem) return
    await updateCategory(selectedItem, category)
    bottomSheetRef.current?.close()
  }

  const handleTrain = async () => {
    setTraining(true)
    const res = await trainModel()
    setTraining(false)
    if (!res) setError("Failed to train model")
  }

  return (
    <>
      <View style={{ flex: 1 }}>
        <PressableScale
          onPress={training ? () => {} : handleTrain}
          style={{
            position: "absolute",
            bottom: 30,
            right: 15,
            backgroundColor: aColor,
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 8,
            zIndex: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {training ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "600" }}>Train</Text>
          )}
        </PressableScale>

        <ScrollView ref={scrollRef} style={{ backgroundColor, flex: 1 }}>
          <View style={{ height: headerHeight, width: "100%" }} />
          {items &&
            Object.values(items).map((item) => {
              if (item.type === "text") {
                return (
                  <PressableScale
                    key={item.id}
                    onPress={() => openBottomSheet(item)}
                  >
                    <ItemEdit item={item} />
                  </PressableScale>
                )
              }
            })}
          <View style={{ height: headerHeight, width: "100%" }} />
        </ScrollView>
      </View>

      <CustomBottomSheet sheetRef={bottomSheetRef} onClose={closeSheet}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 12,
            color: textColor,
          }}
        >
          Select New Category
        </Text>

        <ScrollView
          style={{ height: 670 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {CATEGORY_ORDER.map((category) => (
            <PressableScale
              key={category}
              onPress={() => handleChangeCategory(category)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                marginBottom: 8,
                borderRadius: 10,
                backgroundColor: getSecondaryBackgroundColor(theme),
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text style={{ color: textColor, fontWeight: "500" }}>
                {category}
              </Text>
            </PressableScale>
          ))}
        </ScrollView>
      </CustomBottomSheet>
    </>
  )
}
