package models

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
