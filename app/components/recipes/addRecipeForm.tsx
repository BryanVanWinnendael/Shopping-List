import { useState, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  Switch,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
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
import { X } from "lucide-react-native"
import uuid from "react-native-uuid"
import { uploadRecipeImage } from "@/lib/storage"
import { MealTypeSegment } from "./mealTypeSegment"
import { useInteractions } from "@/stores/useInteractions"
import { PressableScale } from "pressto"
import { GlassOrBlurView } from "../glassOrBlurView"
import { CountryInput } from "./countryInput"
import { ImageInput } from "../inputs/imageInput"
import { router } from "expo-router"

type Props = {
  onSubmit: (recipe: Recipe) => void
}

export function AddRecipeForm({ onSubmit }: Props) {
  const { theme, user, aColor } = useSettings()
  const { setError } = useInteractions()

  const scrollViewRef = useRef<ScrollView>(null)

  const [title, setTitle] = useState("")
  const [publicRecipe, setPublicRecipe] = useState(true)
  const [uri, setUri] = useState<string | null>(null)
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null)
  const [notes, setNotes] = useState("")
  const [source, setSource] = useState("")
  const [list, setList] = useState<Ingredient[]>([])
  const [country, setCountry] = useState<Country | undefined>()
  const [mealType, setMealType] = useState<MealType>("Any")
  const [time, setTime] = useState<number>(0)
  const [uploading, setUploading] = useState(false)

  const backgroundColor = getBackgroundColor(theme)
  const secondaryBackgroundColor = getSecondaryBackgroundColor(theme)
  const borderColor = getBorderColor(theme)
  const textColor = getTextColor(theme)
  const glassBackgroundColor = getBackgroundColor(theme)

  const addListItem = () => {
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

  const submit = async () => {
    if (!title || !user)
      return Alert.alert("Title is required", "Add a title to the recipe.")
    const id = uuid.v4()
    var uploadedImageUrl = ""
    setUploading(true)
    if (image) {
      const result = await uploadRecipeImage(image, id) // upload banner image
      if (!result.ok) {
        setError(result.reason)
        return router.replace("/recipes")
      }

      uploadedImageUrl = result?.url || ""
    }

    const mappedList = await mapList(id) // upload list images and get final list
    if (!mappedList) {
      return router.replace("/recipes")
    }

    const countryString = country ? `${country.flag} ${country.name}` : ""

    const recipe: Recipe = {
      id: id,
      title: title,
      public: publicRecipe,
      image: uploadedImageUrl,
      notes: notes,
      source: source,
      list: mappedList,
      country: countryString,
      mealType: mealType,
      time: time,
      createdBy: user,
    }

    resetForm()
    onSubmit(recipe)
  }

  const mapList = async (id: string) => {
    const imagesList: { url: string }[] = []
    for (const image of list) {
      if (!image.image) continue
      const result = await uploadRecipeImage(image.image, id)
      if (!result.ok) {
        setError(result.reason)
        return false
      }
      if (result?.url) imagesList.push({ url: result.url })
    }

    const res: {
      url?: string
      item: string
      type: "text" | "image"
    }[] = list.map((recipe, index) => ({
      item: recipe.item,
      type: recipe.type,
      url: imagesList[index]?.url || "",
      id: imagesList[index]?.url || "",
    }))

    return res
  }

  const resetForm = () => {
    setTitle("")
    setPublicRecipe(true)
    setUri(null)
    setImage(null)
    setNotes("")
    setSource("")
    setList([])
    setUploading(false)
  }

  const handleSelectImage = (
    uri: string,
    imageAsset: ImagePicker.ImagePickerAsset,
  ) => {
    setUri(uri)
    setImage(imageAsset)
  }

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        style={{ height: 560 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingBottom: 20 }}>
          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                color: textColor,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              Title <Text style={{ color: "#AA4A44" }}>*</Text>
            </Text>
            <TextInput
              keyboardAppearance={theme === "light" ? "light" : "dark"}
              value={title}
              onChangeText={setTitle}
              style={{
                color: textColor,
                backgroundColor: secondaryBackgroundColor,
                borderWidth: 1,
                borderColor: borderColor,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
              placeholder="Recipe title"
              placeholderTextColor="#aaa"
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
              value={publicRecipe}
              onValueChange={setPublicRecipe}
              trackColor={{ false: "#767577", true: aColor }}
              thumbColor={publicRecipe ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#767577"
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
              Image
            </Text>
            {uri ? (
              <View style={{ position: "relative", width: 120, height: 120 }}>
                <Image
                  source={{ uri }}
                  style={{ width: 120, height: 120, borderRadius: 8 }}
                />
                <GlassOrBlurView
                  glassBackgroundColor={glassBackgroundColor}
                  givenGlassBorderColor={glassBackgroundColor}
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <PressableScale onPress={() => setUri(null)}>
                    <X size={16} color={textColor} />
                  </PressableScale>
                </GlassOrBlurView>
              </View>
            ) : (
              <ImageInput onPick={handleSelectImage} type="recipe" />
            )}
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                color: textColor,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              Description
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              style={{
                color: textColor,
                backgroundColor: secondaryBackgroundColor,
                borderWidth: 1,
                borderColor: borderColor,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
              placeholder="Type here..."
              keyboardAppearance={theme === "light" ? "light" : "dark"}
              placeholderTextColor="#aaa"
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
              Source URL
            </Text>
            <TextInput
              value={source}
              onChangeText={setSource}
              style={{
                color: textColor,
                backgroundColor: secondaryBackgroundColor,
                borderWidth: 1,
                borderColor: borderColor,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
              placeholder="https://..."
              keyboardAppearance={theme === "light" ? "light" : "dark"}
              placeholderTextColor="#aaa"
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

          <View style={{ marginBottom: 12 }}>
            <Text
              style={{
                color: textColor,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              Ingredients
            </Text>

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
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 4,
                }}
              >
                <GlassOrBlurView
                  glassBackgroundColor={glassBackgroundColor}
                  givenGlassBorderColor={glassBackgroundColor}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 10,
                  }}
                >
                  <PressableScale
                    onPress={() => {
                      setList((prev) => prev.filter((_, i) => i !== index))
                    }}
                  >
                    <X size={16} color={textColor} />
                  </PressableScale>
                </GlassOrBlurView>

                <TextInput
                  value={item.item}
                  onChangeText={(val) => updateListItem(index, "item", val)}
                  style={{
                    color: textColor,
                    backgroundColor: secondaryBackgroundColor,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: borderColor,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                  }}
                  placeholder="Type here..."
                  keyboardAppearance={theme === "light" ? "light" : "dark"}
                  placeholderTextColor="#aaa"
                />

                {item.image ? (
                  <View
                    style={{
                      position: "relative",
                      width: 100,
                      height: 100,
                      marginTop: 4,
                    }}
                  >
                    <Image
                      source={{ uri: item.image.uri }}
                      style={{ width: 100, height: 100, borderRadius: 8 }}
                    />
                    <GlassOrBlurView
                      glassBackgroundColor={glassBackgroundColor}
                      givenGlassBorderColor={glassBackgroundColor}
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        borderRadius: 12,
                        width: 24,
                        height: 24,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <PressableScale
                        onPress={() => {
                          updateListItem(index, "image", undefined)
                          updateListItem(index, "type", "text")
                        }}
                      >
                        <X size={16} color={textColor} />
                      </PressableScale>
                    </GlassOrBlurView>
                  </View>
                ) : (
                  <ImageInput
                    type="recipe"
                    onPick={(uri, imageAsset) => {
                      updateListItem(index, "image", imageAsset)
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
              <Text
                style={{
                  color: textColor,
                  fontWeight: "600",
                }}
              >
                + Add Ingredients
              </Text>
            </PressableScale>
          </View>
        </View>
      </ScrollView>

      <PressableScale
        style={{
          backgroundColor: aColor,
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 16,
        }}
        onPress={uploading ? () => {} : submit}
      >
        {uploading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <Text style={{ color: "white", fontWeight: "600", zIndex: 1 }}>
            Submit Recipe
          </Text>
        )}
      </PressableScale>
    </>
  )
}
