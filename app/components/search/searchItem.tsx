import { View, Text, StyleSheet, Image } from "react-native"
import type { ProductSearch } from "@/types"
import { useSettings } from "@/stores/useSettings"
import {
  getBorderColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import CategoryIcon from "../categoryIcon"
import AddImageButton from "./addImageButton"
import AddTextButton from "./addTextButton"

type Props = {
  item: ProductSearch
}

export default function SearchItem({ item }: Props) {
  const { fontSize, theme, userColors, user } = useSettings()

  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const borderColor = getBorderColor(theme)
  const textColor = getTextColor(theme)

  const getTextSize = fontSize / 2
  const getLabelSize = fontSize / 3

  const getLabelColor = (): string => {
    const defaultColor = theme === "light" ? "#9ca3af" : "#50555C"
    if (!userColors.enabled || !user) return defaultColor
    const userColor = userColors.colors[user]
    return typeof userColor === "string" ? userColor : defaultColor
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: secondaryBackgroundColor, borderColor },
      ]}
    >
      <View style={styles.innerCard}>
        <Image
          source={{ uri: item.image }}
          style={[styles.image, { backgroundColor: secondaryBackgroundColor }]}
          resizeMode="cover"
        />

        <View style={styles.info}>
          <Text
            style={[
              styles.productName,
              { color: textColor, fontSize: getTextSize },
            ]}
          >
            {item.item}
          </Text>

          <Text
            style={[
              styles.brandName,
              { color: getLabelColor(), fontSize: getLabelSize },
            ]}
          >
            {item.brand}
          </Text>

          <View style={styles.categoryContainer}>
            <CategoryIcon
              theme={theme}
              category={item.category}
              size={25}
              svgSizeSmaller={12}
            />
            <Text
              style={[
                styles.categoryText,
                { color: getLabelColor(), fontSize: getLabelSize },
              ]}
            >
              {item.category}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttons}>
        <AddImageButton item={item} />
        <AddTextButton item={item} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
    overflow: "hidden",
    position: "relative",
    marginHorizontal: 10,
  },
  innerCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttons: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: "center",
    position: "relative",
    paddingBottom: 20,
  },
  productName: {
    fontWeight: "700",
    marginBottom: 4,
  },
  brandName: {
    fontWeight: "400",
    marginBottom: 8,
  },
  categoryContainer: {
    position: "absolute",
    bottom: 4,
    right: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryText: {
    marginLeft: 4,
    fontWeight: "500",
  },
})
