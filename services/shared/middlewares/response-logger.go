package middlewares

import (
	"net/http"
	"shopping-list/shared/logger"
	"shopping-list/shared/models"
	"time"

	"github.com/labstack/echo/v4"
)

type ResponseRecorder struct {
	http.ResponseWriter
	body   []byte
	status int
}

func ResponseLogger(l *logger.Logger) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {

			start := time.Now()

			rec := &ResponseRecorder{
				ResponseWriter: c.Response().Writer,
				status:         200,
			}
			c.Response().Writer = rec

			req := c.Request()
			ctx := req.Context()

			err := next(c)

			latency := time.Since(start)
			status := rec.status

			responseBody := string(rec.body)

			isError := err != nil || status >= 400

			baseOpts := []models.Option{
				logger.WithHTTPMethod(req.Method),
				logger.WithPath(req.URL.Path),
				logger.WithStatusCode(status),
				logger.WithDuration(latency),
				logger.WithPhase("RESPONSE"),
			}

			if len(responseBody) > 0 {
				baseOpts = append(baseOpts,
					logger.WithResponseBody(responseBody),
				)
			}

			if isError {
				l.Error(ctx, "request completed with error", baseOpts...)
			} else {
				l.Info(ctx, "request completed", baseOpts...)
			}

			return err
		}
	}
}

func (r *ResponseRecorder) WriteHeader(code int) {
	r.status = code
	r.ResponseWriter.WriteHeader(code)
}

func (r *ResponseRecorder) Write(b []byte) (int, error) {
	r.body = append(r.body, b...)
	return r.ResponseWriter.Write(b)
}
