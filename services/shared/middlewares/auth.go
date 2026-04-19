package middlewares

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

func AuthMiddleware(next echo.HandlerFunc, apiAuthToken string) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"error": "Missing Authorization header",
			})
		}
		token := strings.TrimPrefix(authHeader, "Bearer ")
		token = strings.TrimSpace(token)

		if apiAuthToken == "" {
			return c.JSON(http.StatusInternalServerError, map[string]string{
				"error": "Server misconfiguration: API_TOKEN missing",
			})
		}

		if token != apiAuthToken {
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"error": "Invalid token",
			})
		}

		return next(c)
	}
}
