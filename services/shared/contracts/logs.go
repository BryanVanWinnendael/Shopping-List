package contracts

import "shopping-list/shared/models"

type LogsResponse struct {
	Page        int             `json:"page"`
	PageSize    int             `json:"pageSize"`
	TotalTraces int             `json:"totalTraces"`
	HasNext     bool            `json:"hasNext"`
	Traces      []*models.Trace `json:"traces"`
}

type GetLogsResponse LogsResponse

type SearchLogsResponse LogsResponse

type CreateLogRequest struct {
	DateTime         string   `json:"dateTime" validate:"required"`
	Text             string   `json:"text" validate:"required"`
	Service          string   `json:"service"  validate:"required"`
	TraceId          string   `json:"traceId" validate:"required"`
	Path             *string  `json:"path,omitempty"`
	RequestBody      *string  `json:"requestBody,omitempty"`
	RequestBodySize  *float64 `json:"requestBodySize,omitempty"`
	ResponseBody     *string  `json:"responseBody,omitempty"`
	ResponseBodySize *float64 `json:"responseBodySize,omitempty"`
	RequestParams    *string  `json:"requestParams,omitempty"`
	DurationMs       *int     `json:"durationMs,omitempty"`
	StatusCode       *int     `json:"statusCode,omitempty"`
	HttpMethod       *string  `json:"httpMethod,omitempty"`
	SpanId           *string  `json:"spanId,omitempty"`
	ParentSpanId     *string  `json:"parentSpanId,omitempty"`
	Phase            *string  `json:"phase,omitempty"`
	Error            *bool    `json:"error,omitempty"`
}

type CreateLogResponse models.Log

type DeleteLogResponse struct {
	Message string `json:"message"`
}
