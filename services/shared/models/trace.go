package models

type ContextKey string

const (
	TraceIdHeader                 = "X-Trace-ID"
	ParentSpanIDHeader            = "X-Parent-Span-ID"
	SpanIdHeader                  = "X-Span-ID"
	TraceIdKey         ContextKey = "trace_id"
	SpanKey            ContextKey = "span"
)

type SpanContext struct {
	SpanId       string
	ParentSpanId string
}

type Trace struct {
	TraceID string      `json:"traceId"`
	Roots   []*SpanNode `json:"roots"`
}

type SpanNode struct {
	SpanID       string      `json:"spanId"`
	ParentSpanID string      `json:"parentSpanId,omitempty"`
	Service      string      `json:"service"`
	Request      *Log        `json:"request,omitempty"`
	Response     *Log        `json:"response,omitempty"`
	Children     []*SpanNode `json:"children"`
}
