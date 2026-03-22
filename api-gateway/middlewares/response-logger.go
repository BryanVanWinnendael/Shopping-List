package middlewares

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

type ResponseRecorder struct {
	io.Writer
	http.ResponseWriter
	status int
}

func (r *ResponseRecorder) WriteHeader(statusCode int) {
	r.status = statusCode
	r.ResponseWriter.WriteHeader(statusCode)
}

func (r *ResponseRecorder) Write(b []byte) (int, error) {
	r.Writer.Write(b)
	return r.ResponseWriter.Write(b)
}

func ResponseLogger(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		start := time.Now()

		var respBuf bytes.Buffer

		rec := &ResponseRecorder{
			Writer:         &respBuf,
			ResponseWriter: c.Response().Writer,
			status:         http.StatusOK,
		}
		c.Response().Writer = rec

		err := next(c)

		fmt.Printf(
			"Completed %d in %v\nResponse Body:\n%s\n",
			rec.status,
			time.Since(start),
			respBuf.String(),
		)

		return err
	}
}
