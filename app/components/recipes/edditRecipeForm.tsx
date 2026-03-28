import { useState, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  Switch,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native"
import { useSettings } from "@/stores/useSettings"
import {
  getTextColor,
  getSecondaryBackgroundColor,
  getBackgroundColor,
  getBorderColor,
} from "@/lib/theme"
import { Recipe, Ingredient, MealType, Country } from "@/types"
import * as ImagePicker from "expo-image-picker"
import * as Haptics from "expo-haptics"
import { X } from "lucide-react-native"
import { deleteRecipeImage, uploadRecipeImage } from "@/lib/storage"
import { MealTypeSegment } from "./mealTypeSegment"
import { PressableScale } from "pressto"
import { useInteractions } from "@/stores/useInteractions"
import { CountryInput } from "./countryInput"
import { ImageInput } from "../inputs/imageInput"
import { router } from "expo-router"

type Props = {
  recipe: Recipe
  onEdit: (recipe: Recipe) => void
}

function convertToCountry(countryStr: string | undefined): Country | undefined {
  if (!countryStr) return undefined
  const countryArray = countryStr.split(" ")
  const country: Country = {
    flag: countryArray[0],
    name: countryArray[1],
  }
  return country
}

export function EditRecipeForm({ recipe, onEdit }: Props) {
  const { theme, aColor } = useSettings()
  const { setError } = useInteractions()

  const scrollViewRef = useRef<ScrollView>(null)

  const [title, setTitle] = useState(recipe.title)
  const [publicRecipe, setPublicRecipe] = useState(recipe.public)
  const [notes, setNotes] = useState(recipe.notes || "")
  const [source, setSource] = useState(recipe.source || "")
  const [country, setCountry] = useState<Country | undefined>(
    convertToCountry(recipe.country),
  )
  const [mealType, setMealType] = useState<MealType>(recipe.mealType || "Any")
  const [time, setTime] = useState<number>(recipe.time || 0)
  const [list, setList] = useState<Ingredient[]>(recipe.list || [])
  const [bannerImage, setBannerImage] = useState<
    string | ImagePicker.ImagePickerAsset | null
  >(recipe.image || null)
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const backgroundColor = getBackgroundColor(theme)
  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const textColor = getTextColor(theme)
  const borderColor = getBorderColor(theme)

  const addListItem = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    setList((prev) => [...prev, { item: "", type: "text" }])
  }

  const updateListItem = (
    index: number,
    field: keyof Ingredient,
    value: any,
  ) => {
    const updated = [...list]
    updated[index][field] = value
    setList(updated)
  }

  const handleRemoveImage = (url?: string) => {
    if (url) setImagesToDelete((prev) => [...prev, url])
  }

  const uploadBannerIfNeeded = async () => {
    if (!bannerImage) return null

    // If it's already a string (existing remote URL), no need to upload
    if (typeof bannerImage === "string") return bannerImage

    const result = await uploadRecipeImage(bannerImage, recipe.id)
    if (!result.ok) {
      setError(result.reason)
      return router.replace("/recipes")
    }

    return result?.url || null
  }

  const uploadIngredientImages = async () => {
    const updatedList: Ingredient[] = []

    for (const ingredient of list) {
      if (ingredient.type === "image" && ingredient.image) {
        const result = await uploadRecipeImage(ingredient.image, recipe.id)
        if (!result.ok) {
          setError(result.reason)
          router.replace("/recipes")
          return []
        }

        updatedList.push({
          ...ingredient,
          url: result?.url,
          image: undefined,
        })
      } else {
        updatedList.push(ingredient)
      }
    }

    return updatedList
  }

  const removeOldImages = async () => {
    for (const url of imagesToDelete) {
      if (url.trim()) {
        const success = await deleteRecipeImage(recipe.id, url)
        if (!success) setError("Failed to delete image")
      }
    }
  }

  const submit = async () => {
    if (!title.trim()) return alert("Title is required")

    try {
      setUploading(true)

      const [bannerUrl, mappedList] = await Promise.all([
        uploadBannerIfNeeded(),
        uploadIngredientImages(),
      ])

      const countryString = country ? `${country.flag} ${country.name}` : ""

      await removeOldImages()
      const updatedRecipe: Recipe = {
        ...recipe,
        title,
        public: publicRecipe,
        image: bannerUrl || "remove",
        notes,
        source,
        country: countryString,
        mealType: mealType,
        time,
        list: mappedList,
      }

      onEdit(updatedRecipe)
      setImagesToDelete([])
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        style={{ height: 560 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingBottom: 20 }}>
          <FieldLabel theme={theme} label="Title" required />
          <StyledInput
            theme={theme}
            value={title}
            onChangeText={setTitle}
            placeholder="Recipe title"
          />

          <FieldLabel theme={theme} label="Public" />
          <Switch
            value={publicRecipe}
            onValueChange={setPublicRecipe}
            trackColor={{ false: "#767577", true: aColor }}
            thumbColor={publicRecipe ? "#fff" : "#f4f3f4"}
            ios_backgroundColor="#767577"
          />

          <FieldLabel theme={theme} label="Image" />
          {bannerImage ? (
            <View style={{ position: "relative", width: 120, height: 120 }}>
              <Image
                source={{
                  uri:
                    typeof bannerImage === "string"
                      ? bannerImage
                      : bannerImage.uri,
                }}
                style={{ width: 120, height: 120, borderRadius: 8 }}
              />
              <PressableScale
                onPress={() => {
                  if (typeof bannerImage === "string")
                    handleRemoveImage(bannerImage)
                  setBannerImage(null)
                }}
                style={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  backgroundColor: backgroundColor,
                  borderRadius: 12,
                  width: 24,
                  height: 24,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <X size={16} color={textColor} />
              </PressableScale>
            </View>
          ) : (
            <ImageInput
              type="recipe"
              onPick={(uri, img) => setBannerImage(img)}
            />
          )}

          <FieldLabel theme={theme} label="Description" />
          <StyledInput
            theme={theme}
            value={notes}
            onChangeText={setNotes}
            placeholder="Type here..."
          />

          <FieldLabel theme={theme} label="Source URL" />
          <StyledInput
            theme={theme}
            value={source}
            onChangeText={setSource}
            placeholder="https://..."
          />

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
              value={mealType}
              onChange={(val) => setMealType(val as MealType)}
              theme={theme}
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
            <CountryInput value={country} onChange={setCountry} />
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                color: textColor,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              Time (minutes)
            </Text>
            <TextInput
              value={time !== null ? String(time) : ""}
              onChangeText={(val) => setTime(val ? parseInt(val) : 0)}
              keyboardType="numeric"
              returnKeyType="done"
              style={{
                color: textColor,
                backgroundColor: secondaryBackgroundColor,
                borderWidth: 1,
                borderColor: borderColor,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
              placeholder="e.g., 45"
              keyboardAppearance={theme === "light" ? "light" : "dark"}
              placeholderTextColor="#aaa"
            />
          </View>

          <FieldLabel theme={theme} label="Ingredients" />
          {list.map((item, index) => (
            <View
              key={index}
              style={{
                borderWidth: 1,
                borderColor: borderColor,
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                backgroundColor: secondaryBackgroundColor,
              }}
            >
              <PressableScale
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                  if (item.url) handleRemoveImage(item.url)
                  setList((prev) => prev.filter((_, i) => i !== index))
                }}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: backgroundColor,
                  borderRadius: 12,
                  width: 24,
                  height: 24,
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 10,
                }}
              >
                <X size={16} color={textColor} />
              </PressableScale>

              <StyledInput
                theme={theme}
                value={item.item}
                onChangeText={(val: any) => updateListItem(index, "item", val)}
                placeholder="Ingredient..."
              />

              {item.url || item.image ? (
                <View
                  style={{
                    position: "relative",
                    width: 100,
                    height: 100,
                    marginTop: 4,
                  }}
                >
                  <Image
                    source={{
                      uri: item.image ? item.image.uri : item.url,
                    }}
                    style={{ width: 100, height: 100, borderRadius: 8 }}
                  />
                  <PressableScale
                    onPress={() => {
                      if (item.url) handleRemoveImage(item.url)
                      updateListItem(index, "image", undefined)
                      updateListItem(index, "url", undefined)
                      updateListItem(index, "type", "text")
                    }}
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      backgroundColor: backgroundColor,
                      borderRadius: 12,
                      width: 24,
                      height: 24,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <X size={16} color={textColor} />
                  </PressableScale>
                </View>
              ) : (
                <ImageInput
                  type="recipe"
                  onPick={(uri, img) => {
                    updateListItem(index, "image", img)
                    updateListItem(index, "type", "image")
                  }}
                />
              )}
            </View>
          ))}

          <PressableScale
            onPress={addListItem}
            style={{
              backgroundColor: backgroundColor,
              padding: 10,
              borderWidth: 1,
              borderColor: borderColor,
              borderRadius: 12,
              marginTop: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: textColor, fontWeight: "600" }}>
              + Add Ingredient
            </Text>
          </PressableScale>
        </View>
      </ScrollView>

      <PressableScale
        onPress={uploading ? () => {} : submit}
        style={{
          backgroundColor: aColor,
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 16,
        }}
      >
        {uploading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <Text style={{ color: "white", fontWeight: "600", zIndex: 1 }}>
            Save Changes
          </Text>
        )}
      </PressableScale>
    </>
  )
}

function FieldLabel({ theme, label, required = false }: any) {
  return (
    <Text
      style={{
        color: getTextColor(theme),
        fontWeight: "600",
        marginTop: 12,
        marginBottom: 6,
      }}
    >
      {label} {required && <Text style={{ color: "#AA4A44" }}>*</Text>}
    </Text>
  )
}

function StyledInput({ theme, ...props }: any) {
  return (
    <TextInput
      keyboardAppearance={theme === "light" ? "light" : "dark"}
      {...props}
      style={{
        color: getTextColor(theme),
        backgroundColor: getSecondaryBackgroundColor(theme),
        borderWidth: 1,
        borderColor: getBorderColor(theme),
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
      }}
      placeholderTextColor="#aaa"
    />
  )
}
