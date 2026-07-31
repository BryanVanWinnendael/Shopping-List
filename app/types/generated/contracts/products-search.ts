// THIS IS AN AUTO GENERATED FILE BY SHOPPING LIST CONTRACT GENERATOR. DO NOT EDIT.

import { Category } from "../models/category"
import { Product } from "../models/product"

export interface ProductsSearchResponse {
  products: Product[]
  dateUpdated: string
  total: number
  page: number
  pageSize: number
  totalPages: number
  product: string
  category: Category
}

