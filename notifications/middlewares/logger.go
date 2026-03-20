package middlewares

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"time"

	"github.com/labstack/echo/v4"
)

func RequestLogger(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		start := time.Now()

		req := c.Request()
		res := c.Response()

		var body []byte
		if req.Body != nil {
			bodyBytes, err := ioutil.ReadAll(req.Body)
			if err == nil {
				body = bodyBytes
			}
			req.Body = ioutil.NopCloser(ioutil.NopCloser(bytes.NewBuffer(body)))
		}

		fmt.Printf("[%s] %s %s\n", start.Format(time.RFC3339), req.Method, req.URL.Path)
		if len(body) > 0 {
			fmt.Printf("Body: %s\n", string(body))
		}

		err := next(c)

		fmt.Printf("Completed %d in %v\n", res.Status, time.Since(start))
		return err
	}
}
