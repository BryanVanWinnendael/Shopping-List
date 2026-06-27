package middlewares

import (
	"bytes"
	"fmt"
	"io"
	"shopping-list/shared/logger"
	"shopping-list/shared/models"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
)

func RequestLogger(l *logger.Logger) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {

			req := c.Request()
			ctx := req.Context()

			start := time.Now()

			ct := req.Header.Get("Content-Type")

			path := req.URL.Path
			if req.URL.RawQuery != "" {
				path = fmt.Sprintf("%s?%s", path, req.URL.RawQuery)
			}

			opts := []models.Option{
				logger.WithHTTPMethod(req.Method),
				logger.WithPath(path),
			}

			if strings.HasPrefix(ct, "multipart/form-data") {
				if err := req.ParseMultipartForm(32 << 20); err == nil && req.MultipartForm != nil {

					var totalSize int64

					var fileSummary []string

					for field, files := range req.MultipartForm.File {
						for _, f := range files {
							totalSize += f.Size
							fileSummary = append(fileSummary, fmt.Sprintf("%s:%s", field, f.Filename))
						}
					}

					opts = append(opts,
						logger.WithRequestBodySize(float64(totalSize)/1024/1024), // MB
					)
				}

			} else {
				body, _ := readRequestBody(c)

				if body != "" {
					opts = append(opts,
						logger.WithRequestBody(body),
						logger.WithRequestBodySize(float64(len(body))/1024/1024), // MB
					)
				} else if req.ContentLength > 0 {
					opts = append(opts,
						logger.WithRequestBodySize(float64(req.ContentLength)/1024/1024),
					)
				}
			}

			err := next(c)

			opts = append(opts,
				logger.WithDuration(time.Since(start)),
				logger.WithPhase("REQUEST"),
			)

			l.Info(ctx, "incoming request", opts...)

			return err
		}
	}
}

func readRequestBody(c echo.Context) (string, error) {
	req := c.Request()

	if req.Body == nil {
		return "", nil
	}

	b, err := io.ReadAll(req.Body)
	if err != nil {
		return "", err
	}

	req.Body = io.NopCloser(bytes.NewBuffer(b))

	return string(b), nil
}
