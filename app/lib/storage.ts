import * as ImagePicker from "expo-image-picker"
import { UploadResponse, UploadResult } from "@/types"
import { httpRequest } from "./httpHelper"
import { AxiosError } from "axios"

const STORAGE_PATH = "storage"

export const uploadRecipeImage = async (
  file: ImagePicker.ImagePickerAsset,
  id: string,
): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append("image", {
    uri: file.uri,
    name: file.fileName || "upload.jpg",
    type: file.mimeType || "image/jpeg",
  } as any)

  try {
    const response = await httpRequest<{ large: string; small: string }>({
      url: `${STORAGE_PATH}/recipes/images/${id}`,
      method: "POST",
      body: formData,
      contentType: "multipart/form-data",
    })

    return { ok: true, url: response.data.large }
  } catch (error: any) {
    if (error.response?.status === 413) {
      return { ok: false, reason: UploadResult.Size }
    }
    return { ok: false, reason: UploadResult.Error }
  }
}

export const deleteRecipeImage = async (
  id: string,
  imageUrl: string,
): Promise<boolean> => {
  try {
    await httpRequest<void, { url: string }>({
      url: `${STORAGE_PATH}/recipes/images/${id}`,
      method: "DELETE",
      body: { url: imageUrl },
    })

    return true
  } catch {
    return false
  }
}

export const deleteRecipeStorage = async (id: string): Promise<boolean> => {
  try {
    await httpRequest<void>({
      url: `${STORAGE_PATH}/recipes/${id}`,
      method: "DELETE",
    })

    return true
  } catch (e) {
    return false
  }
}

export const uploadListImage = async (
  file: ImagePicker.ImagePickerAsset,
  id: string,
): Promise<UploadResponse> => {
  const formData = new FormData()
  formData.append("image", {
    uri: file.uri,
    name: file.fileName || "upload.jpg",
    type: file.mimeType || "image/jpeg",
  } as any)

  try {
    const response = await httpRequest<{ large: string; small: string }>({
      url: `${STORAGE_PATH}/list/images/${id}`,
      method: "POST",
      body: formData,
    })

    return { ok: true, url: response.data.large }
  } catch (error: any) {
    if (error.response?.status === 413) {
      return { ok: false, reason: UploadResult.Size }
    }
    return { ok: false, reason: UploadResult.Error }
  }
}

export const deleteListImage = async (
  id: string,
  imageUrl: string,
): Promise<boolean> => {
  try {
    await httpRequest<void>({
      url: `${STORAGE_PATH}/list/images/${id}`,
      method: "DELETE",
      body: { url: imageUrl },
    })

    return true
  } catch {
    return false
  }
}
