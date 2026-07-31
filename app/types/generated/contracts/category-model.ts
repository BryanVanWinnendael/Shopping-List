// THIS IS AN AUTO GENERATED FILE BY SHOPPING LIST CONTRACT GENERATOR. DO NOT EDIT.

import { Category } from "../models/category"
import { CategoryProduct } from "../models/category_product"

export interface TrainModelResponse {
  model: string
  accuracy: number
}

export interface CreateCategoryRequest {
  product: string
  category: Category
}

export type CreateCategoryResponse = CategoryProduct

export type GetCategoryResponse = CategoryProduct

