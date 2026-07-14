// THIS IS AN AUTO GENERATED FILE BY SHOPPING LIST CONTRACT GENERATOR. DO NOT EDIT.

import { Trace } from "../models/trace"
import { Log } from "../models/log"

export interface LogsResponse {
  page: number
  pageSize: number
  totalTraces: number
  hasNext: boolean
  traces: Trace[]
}

export type GetLogsResponse = LogsResponse

export type SearchLogsResponse = LogsResponse

export interface CreateLogRequest {
  dateTime: string
  text: string
  service: string
  traceId: string
  path?: string | null
  requestBody?: string | null
  requestBodySize?: number | null
  responseBody?: string | null
  responseBodySize?: number | null
  requestParams?: string | null
  durationMs?: number | null
  statusCode?: number | null
  httpMethod?: string | null
  spanId?: string | null
  parentSpanId?: string | null
  phase?: string | null
  error?: boolean | null
}

export type CreateLogResponse = Log

export interface DeleteLogResponse {
  message: string
}

