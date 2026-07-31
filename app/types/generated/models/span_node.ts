// THIS IS AN AUTO GENERATED FILE BY SHOPPING LIST CONTRACT GENERATOR. DO NOT EDIT.

import { Log } from "./log"

export interface SpanNode {
  spanId: string
  parentSpanId?: string | null
  service: string
  request?: Log | null
  response?: Log | null
  children: SpanNode[]
}
