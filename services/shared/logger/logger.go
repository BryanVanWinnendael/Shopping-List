package logger

import (
	"context"
	"fmt"
	netHttp "net/http"
	"shopping-list/shared/contracts"
	"shopping-list/shared/http"
	"shopping-list/shared/models"
	"strings"
	"time"
)

type Logger struct {
	Client  *http.Client
	LogURL  string
	Service string
}

const (
	colorReset  = "\033[0m"
	colorRed    = "\033[31m"
	colorGreen  = "\033[32m"
	colorYellow = "\033[33m"
	colorBlue   = "\033[34m"
	colorCyan   = "\033[36m"
)

func New(client *http.Client, logURL string, service string) *Logger {
	return &Logger{
		Client:  client,
		LogURL:  logURL,
		Service: service,
	}
}

func DefaultOptions() models.LogOptions {
	return models.LogOptions{}
}

func WithHTTPMethod(m string) models.Option {
	return func(o *models.LogOptions) {
		o.HttpMethod = m
	}
}

func WithPath(p string) models.Option {
	return func(o *models.LogOptions) {
		o.Path = p
	}
}

func WithDuration(d time.Duration) models.Option {
	return func(o *models.LogOptions) {
		o.DurationMs = int(d.Milliseconds())
	}
}

func WithStatusCode(code int) models.Option {
	return func(o *models.LogOptions) {
		o.StatusCode = code
	}
}

func WithRequestBody(body string) models.Option {
	return func(o *models.LogOptions) {
		o.RequestBody = body
	}
}

func WithRequestBodySize(bodySize float64) models.Option {
	return func(o *models.LogOptions) {
		o.RequestBodySize = bodySize
	}
}

func WithResponseBody(body string) models.Option {
	return func(o *models.LogOptions) {
		o.ResponseBody = body
	}
}

func WithResponseBodySize(bodySize float64) models.Option {
	return func(o *models.LogOptions) {
		o.ResponseBodySize = bodySize
	}
}

func WithPhase(p string) models.Option {
	return func(o *models.LogOptions) {
		o.Phase = p
	}
}

func getSpan(ctx context.Context) (spanId string, parentSpanId string) {
	v := ctx.Value(models.SpanKey)
	if v == nil {
		return "-", "-"
	}

	span, ok := v.(*models.SpanContext)
	if !ok || span == nil {
		return "-", "-"
	}

	return span.SpanId, span.ParentSpanId
}

func (l *Logger) log(ctx context.Context, level string, msg string, opts ...models.Option) {
	options := DefaultOptions()

	for _, opt := range opts {
		opt(&options)
	}

	traceID, _ := ctx.Value(models.TraceIdKey).(string)
	spanId, parentSpanId := getSpan(ctx)

	isError := level == "ERROR"

	payload := contracts.CreateLogRequest{
		TraceId:          traceID,
		SpanId:           &spanId,
		ParentSpanId:     &parentSpanId,
		Text:             msg,
		DateTime:         time.Now().UTC().Format(time.RFC3339Nano),
		Service:          l.Service,
		Error:            &isError,
		Phase:            &options.Phase,
		HttpMethod:       &options.HttpMethod,
		Path:             &options.Path,
		StatusCode:       &options.StatusCode,
		DurationMs:       &options.DurationMs,
		RequestBody:      &options.RequestBody,
		RequestBodySize:  &options.RequestBodySize,
		ResponseBody:     &options.ResponseBody,
		ResponseBodySize: &options.ResponseBodySize,
	}

	if spanId != "-" {
		payload.SpanId = &spanId
	}
	if parentSpanId != "-" {
		payload.ParentSpanId = &parentSpanId
	}

	if options.HttpMethod != "" {
		payload.HttpMethod = &options.HttpMethod
	}

	if options.Path != "" {
		payload.Path = &options.Path
	}

	if options.DurationMs != 0 {
		v := options.DurationMs
		payload.DurationMs = &v
	}

	if options.StatusCode != 0 {
		v := options.StatusCode
		payload.StatusCode = &v
	}

	if options.RequestBody != "" {
		payload.RequestBody = &options.RequestBody
	}

	if options.Phase != "" {
		payload.Phase = &options.Phase
	} else {
		def := "UNKNOWN"
		payload.Phase = &def
	}

	printLog(payload)

	go func(p contracts.CreateLogRequest) {
		defer func() {
			if r := recover(); r != nil {
				fmt.Printf(
					"%s[LOGGER PANIC]%s %v\n",
					colorRed,
					colorReset,
					r,
				)
			}
		}()

		logCtx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()

		if err := l.send(logCtx, p); err != nil {
			fmt.Printf(
				"%s[LOGGER ERROR]%s failed to send log: %v\n",
				colorRed,
				colorReset,
				err,
			)
		}
	}(payload)
}

func (l *Logger) Info(ctx context.Context, msg string, opts ...models.Option) {
	l.log(ctx, "INFO", msg, opts...)
}

func (l *Logger) Error(ctx context.Context, msg string, opts ...models.Option) {
	l.log(ctx, "ERROR", msg, opts...)
}

func printLog(log contracts.CreateLogRequest) {
	levelColor := colorBlue
	level := "INFO"

	if log.Error != nil && *log.Error {
		levelColor = colorRed
		level = "ERROR"
	}

	method := "-"
	if log.HttpMethod != nil {
		method = *log.HttpMethod
	}

	path := "-"
	if log.Path != nil {
		path = *log.Path
	}

	status := "-"
	statusColor := colorGreen
	if log.StatusCode != nil {
		status = fmt.Sprintf("%d", *log.StatusCode)

		switch {
		case *log.StatusCode >= 500:
			statusColor = colorRed
		case *log.StatusCode >= 400:
			statusColor = colorYellow
		}
	}

	duration := "-"
	durationColor := colorGreen
	if log.DurationMs != nil {
		duration = fmt.Sprintf("%dms", *log.DurationMs)

		if *log.DurationMs > 1000 {
			durationColor = colorRed
		} else if *log.DurationMs > 500 {
			durationColor = colorYellow
		}
	}

	fmt.Printf(
		"%s[%s %s]%s %s | %s%s%s %s | %s%s%s | %s%s%s | %s\n",
		levelColor,
		level,
		log.Service,
		colorReset,

		log.DateTime,

		colorCyan, method, colorReset, path,

		statusColor, status, colorReset,

		durationColor, duration, colorReset,

		log.TraceId,
	)
}

func (l *Logger) send(ctx context.Context, request contracts.CreateLogRequest) error {
	// don't log creating/deleting/getting logs and backups
	if request.Path != nil && (strings.Contains(*request.Path, "/api/logs") || strings.Contains(*request.Path, "backup")) {
		return nil
	}

	var response contracts.CreateLogResponse

	_, err := l.Client.DoRequest(
		ctx,
		netHttp.MethodPost,
		l.LogURL,
		nil,
		request,
		&response,
	)

	if err != nil {
		return err
	}

	return nil
}
