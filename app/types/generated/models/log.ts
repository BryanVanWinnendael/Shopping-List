// THIS IS AN AUTO GENERATED FILE BY SHOPPING LIST CONTRACT GENERATOR. DO NOT EDIT.

import { Action } from "./action"

export interface Log {
  dateTime: string
  text: string
  service: string
  traceId: string
  path?: string | null
  requestBodyCompressed?: string | null
  requestBodySize?: number | null
  responseBodyCompressed?: string | null
  responseBodySize?: number | null
  durationMs?: number | null
  statusCode?: number | null
  httpMethod?: Action | null
  spanId?: string | null
  parentSpanId?: string | null
  phase?: string | null
  error?: boolean | null
}
