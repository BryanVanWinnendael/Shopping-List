// THIS IS AN AUTO GENERATED FILE BY SHOPPING LIST CONTRACT GENERATOR. DO NOT EDIT.

import { CategoryProduct } from "../models/category_product"
import { Category } from "../models/category"

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

