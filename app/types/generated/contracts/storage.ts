// THIS IS AN AUTO GENERATED FILE BY SHOPPING LIST CONTRACT GENERATOR. DO NOT EDIT.

import { Image } from "../models/image"

export type UploadImageResponse = Image

export interface DeleteImageRequest {
  url: string
}

export interface DeleteImageResponse {
  message: string
  large?: string | null
}

export interface DeleteStorageResponse {
  message: string
  id?: string | null
}

