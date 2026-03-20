import { GatewayResponse } from "@/types"
import axios, { AxiosRequestConfig, ResponseType } from "axios"
import { API_GATEWAY, API_KEY } from "@env"
import qs from "qs"

interface RequestOptions<Req = any> {
  url: string
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  body?: Req
  params?: Record<string, any>
  responseType?: ResponseType
  headers?: Record<string, string>
  contentType?: string
}

export async function httpRequest<Res = any, Req = any>({
  url,
  method = "GET",
  body,
  params,
  responseType = "json",
  headers = {},
  contentType,
}: RequestOptions<Req>): Promise<GatewayResponse<Res>> {
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData

  const finalHeaders: Record<string, string> = {
    Authorization: API_KEY,
    ...headers,
  }

  if (!isFormData) {
    finalHeaders["Content-Type"] = contentType || "application/json"
  }

  const config: AxiosRequestConfig = {
    baseURL: API_GATEWAY,
    url,
    method,
    params,
    headers: finalHeaders,
    responseType,
    data: body,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  }

  try {
    const response = await axios(config)
    return { data: response.data.data as Res }
  } catch (error: any) {
    console.error("HTTP Request failed:", error.message || error)
    throw error
  }
}
