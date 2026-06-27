package middlewares

import (
	"context"
	"shopping-list/shared/models"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

func TraceMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {

		traceId := c.Request().Header.Get(models.TraceIdHeader)
		if traceId == "" {
			traceId = uuid.NewString()
		}

		parentSpanId := c.Request().Header.Get("X-Span-ID")
		if parentSpanId == "" {
			parentSpanId = ""
		}

		spanId := uuid.NewString()

		span := &models.SpanContext{
			SpanId:       spanId,
			ParentSpanId: parentSpanId,
		}

		ctx := c.Request().Context()
		ctx = context.WithValue(ctx, models.TraceIdKey, traceId)
		ctx = context.WithValue(ctx, models.SpanKey, span)

		req := c.Request().WithContext(ctx)

		req.Header.Set(models.TraceIdHeader, traceId)
		req.Header.Set("X-Span-ID", spanId)

		c.SetRequest(req)

		c.Response().Header().Set(models.TraceIdHeader, traceId)
		c.Response().Header().Set("X-Span-ID", spanId)

		return next(c)
	}
}
