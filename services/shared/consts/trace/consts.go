package trace

type ContextKey string

type SpanContext struct {
	SpanId       string `json:"spanId"`
	ParentSpanId string `json:"parentSpanId,omitempty"`
}

const (
	TraceIdHeader                 = "X-Trace-ID"
	ParentSpanIDHeader            = "X-Parent-Span-ID"
	SpanIdHeader                  = "X-Span-ID"
	TraceIdKey         ContextKey = "trace_id"
	SpanKey            ContextKey = "span"
)
