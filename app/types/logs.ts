export type Action = "GET" | "POST" | "DELETE" | "PUT"

export type Log = {
    dateTime: string
    text: string
    service: string
    traceId: string
    path?: string | null
    requestBodyCompressed?: string | null
    requestBodySize?: number | null
    responseBodyCompressed?: string | null
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

export type SpanNode = {
    spanId: string
    parentSpanId?: string
    service: string
    request?: Log | null
    response?: Log | null
    children: SpanNode[]
}

export type Trace = {
    traceId: string
    roots: SpanNode[]
}

export type GetLogsResponse = {
    page: number
    pageSize: number
    hasNext: boolean
    totalTraces?: number
    traces: Trace[]
}

export type CreateLogRequest = {
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

export type DeleteLogResponse = {
    message: string
}
