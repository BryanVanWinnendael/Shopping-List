// THIS IS AN AUTO GENERATED FILE BY SHOPPING LIST CONTRACT GENERATOR. DO NOT EDIT.

import { Product } from "../models/product"
import { Category } from "../models/category"

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

