package models

type Action string

const (
	ActionGET    Action = "GET"
	ActionPOST   Action = "POST"
	ActionDELETE Action = "DELETE"
	ActionPUT    Action = "PUT"
)

type Log struct {
	DateTime               string   `json:"dateTime"`
	Text                   string   `json:"text"`
	Service                string   `json:"service"`
	TraceId                string   `json:"traceId"`
	Path                   *string  `json:"path,omitempty"`
	RequestBodyCompressed  *string  `json:"requestBodyCompressed,omitempty"`
	RequestBodySize        *float64 `json:"requestBodySize,omitempty"`
	ResponseBodyCompressed *string  `json:"responseBodyCompressed,omitempty"`
	ResponseBodySize       *float64 `json:"responseBodySize,omitempty"`
	DurationMs             *int     `json:"durationMs,omitempty"`
	StatusCode             *int     `json:"statusCode,omitempty"`
	HttpMethod             *Action  `json:"httpMethod,omitempty"`
	SpanId                 *string  `json:"spanId,omitempty"`
	ParentSpanId           *string  `json:"parentSpanId,omitempty"`
	Phase                  *string  `json:"phase,omitempty"`
	Error                  *bool    `json:"error,omitempty"`
}
