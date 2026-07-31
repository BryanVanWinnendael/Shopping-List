// THIS IS AN AUTO GENERATED FILE BY SHOPPING LIST CONTRACT GENERATOR. DO NOT EDIT.

import { Category } from "../models/category"
import { CronProduct } from "../models/cron_product"

export interface CreateCronProductRequest {
  category: Category
  user: string
  product: string
}

export type CreateCronProductResponse = CronProduct

export interface UpdateCronProductCategoryRequest {
  category: Category
}

export type UpdateCronProductCategoryResponse = CronProduct

export type GetAllCronProductsResponse = CronProduct[]

export type GetCronProductsByUserResponse = CronProduct[]

export interface DeleteCronProductResponse {
  id: string
  message?: string | null
}

