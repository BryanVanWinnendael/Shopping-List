package response

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type APIResponse struct {
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Fields  []string    `json:"fields,omitempty"`
}

type MissingSource string

const (
	SourceBody          MissingSource = "body"
	SourceQuery         MissingSource = "query"
	SourceParam         MissingSource = "param"
	SourceImage         MissingSource = "image"
	InvalidBodyResponse string        = "Invalid body"
)

func Success(c echo.Context, status int, data interface{}) error {
	resp := APIResponse{}
	resp.Data = data

	return c.JSON(status, resp)
}

func Error(c echo.Context, status int, message string) error {
	return c.JSON(status, APIResponse{
		Error: message,
	})
}

func Missing(c echo.Context, source MissingSource, fields ...string) error {
	return c.JSON(http.StatusBadRequest, APIResponse{
		Error:  buildMissingMessage(source),
		Fields: fields,
	})
}

func buildMissingMessage(source MissingSource) string {
	switch source {
	case SourceBody:
		return "Missing required body field(s)"
	case SourceQuery:
		return "Missing required query parameter(s)"
	case SourceParam:
		return "Missing required path parameter(s)"
	case SourceImage:
		return "Missing or invalid image file"
	default:
		return "Missing required field(s)"
	}
}
