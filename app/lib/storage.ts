import * as ImagePicker from "expo-image-picker"
import {httpRequest} from "./httpHelper"
import {DeleteImageRequest, DeleteImageResponse, DeleteStorageResponse, UploadImageResponse} from "@/types/storage"
import Toast from "react-native-toast-message"

const STORAGE_PATH = "storage"

const uploadRecipeImage = async (
    file: ImagePicker.ImagePickerAsset,
    id: string
): Promise<UploadImageResponse | null> => {
    const formData = new FormData()
    formData.append("image", {
        uri: file.uri,
        name: file.fileName || "upload.jpg",
        type: file.mimeType || "image/jpeg",
    } as any)

    try {
        const response = await httpRequest<UploadImageResponse>({
            url: `${STORAGE_PATH}/recipes/images/${id}`,
            method: "POST",
            body: formData,
            contentType: "multipart/form-data",
        })

        return response.data
    } catch (error: any) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to upload image",
        })
        return null
    }
}

const deleteRecipeImage = async (id: string, request: DeleteImageRequest): Promise<DeleteImageResponse | null> => {
    try {
        const response = await httpRequest<DeleteImageResponse>({
            url: `${STORAGE_PATH}/recipes/images/${id}`,
            method: "DELETE",
            body: request,
        })

        return response.data
    } catch (error: any) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to delete image",
        })
        return null
    }
}

const deleteRecipeStorage = async (id: string): Promise<DeleteStorageResponse | null> => {
    try {
        const response = await httpRequest<DeleteStorageResponse>({
            url: `${STORAGE_PATH}/recipes/${id}`,
            method: "DELETE",
        })

        return response.data
    } catch (error: any) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to delete images",
        })
        return null
    }
}

const uploadListImage = async (file: ImagePicker.ImagePickerAsset, id: string): Promise<UploadImageResponse | null> => {
    const formData = new FormData()
    formData.append("image", {
        uri: file.uri,
        name: file.fileName || "upload.jpg",
        type: file.mimeType || "image/jpeg",
    } as any)

    try {
        const response = await httpRequest<UploadImageResponse>({
            url: `${STORAGE_PATH}/list/images/${id}`,
            method: "POST",
            body: formData,
        })

        return response.data
    } catch (error: any) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to upload image",
        })
        return null
    }
}

const deleteListImage = async (id: string, request: DeleteImageRequest): Promise<DeleteImageResponse | null> => {
    try {
        const response = await httpRequest<DeleteImageResponse>({
            url: `${STORAGE_PATH}/list/images/${id}`,
            method: "DELETE",
            body: request,
        })

        return response.data
    } catch (error: any) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to delete image",
        })
        return null
    }
}

export const storageClient = {
    uploadRecipeImage,
    deleteRecipeImage,
    deleteRecipeStorage,
    uploadListImage,
    deleteListImage,
}
