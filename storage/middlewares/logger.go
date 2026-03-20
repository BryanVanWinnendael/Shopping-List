package middlewares

import (
	"fmt"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
)

func RequestLogger(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		start := time.Now()

		req := c.Request()
		res := c.Response()

		ct := req.Header.Get("Content-Type")
		cl := req.ContentLength

		if cl > 0 {
			fmt.Printf(
				"[%s] %s %s | Content-Type=%s | Content-Length=%.2f MB\n",
				start.Format(time.RFC3339),
				req.Method,
				req.URL.Path,
				ct,
				bytesToMB(cl),
			)
		} else {
			fmt.Printf(
				"[%s] %s %s | Content-Type=%s | Content-Length=unknown\n",
				start.Format(time.RFC3339),
				req.Method,
				req.URL.Path,
				ct,
			)
		}

		if strings.HasPrefix(ct, "multipart/form-data") {
			form, err := c.MultipartForm()
			if err == nil && form != nil {
				for field, files := range form.File {
					for _, f := range files {
						fmt.Printf(
							"  File field=%s name=%s size=%.2f MB mime=%s\n",
							field,
							f.Filename,
							bytesToMB(f.Size),
							f.Header.Get("Content-Type"),
						)
					}
				}
			}
		}

		err := next(c)

		fmt.Printf(
			"Completed %d in %v\n",
			res.Status,
			time.Since(start),
		)

		return err
	}
}

func bytesToMB(b int64) float64 {
	return float64(b) / 1024 / 1024
}
