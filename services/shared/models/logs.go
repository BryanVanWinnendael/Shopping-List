package models

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
	HttpMethod             *string  `json:"httpMethod,omitempty"`
	SpanId                 *string  `json:"spanId,omitempty"`
	ParentSpanId           *string  `json:"parentSpanId,omitempty"`
	Phase                  *string  `json:"phase,omitempty"`
	Error                  *bool    `json:"error,omitempty"`
}

type Option func(*LogOptions)

type LogOptions struct {
	HttpMethod       string
	DurationMs       int
	StatusCode       int
	RequestBody      string
	RequestBodySize  float64
	ResponseBody     string
	ResponseBodySize float64
	Path             string
	SpanId           string
	ParentSpanId     string
	Phase            string
}
