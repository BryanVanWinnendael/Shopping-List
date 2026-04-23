package http

import (
	"bytes"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
)

type MultipartFile struct {
	FieldName string
	FileName  string
	Content   []byte
}

func SetupEcho(method, url string, body []byte) (echo.Context, *httptest.ResponseRecorder) {
	e := echo.New()

	var req *http.Request
	if body != nil {
		req = httptest.NewRequest(method, url, bytes.NewBuffer(body))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	} else {
		req = httptest.NewRequest(method, url, nil)
	}

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	return c, rec
}

func SetupMultipartEcho(
	t *testing.T,
	method, url string,
	files []MultipartFile,
	fields map[string]string) (echo.Context, *httptest.ResponseRecorder) {

	e := echo.New()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	for _, f := range files {
		part, err := writer.CreateFormFile(f.FieldName, f.FileName)
		if err != nil {
			t.Fatalf("failed to create form file: %v", err)
		}

		if _, err := part.Write(f.Content); err != nil {
			t.Fatalf("failed to write file content: %v", err)
		}
	}

	for key, value := range fields {
		if err := writer.WriteField(key, value); err != nil {
			t.Fatalf("failed to write field: %v", err)
		}
	}

	if err := writer.Close(); err != nil {
		t.Fatalf("failed to close writer: %v", err)
	}

	req := httptest.NewRequest(method, url, body)
	req.Header.Set(echo.HeaderContentType, writer.FormDataContentType())

	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	return c, rec
}
