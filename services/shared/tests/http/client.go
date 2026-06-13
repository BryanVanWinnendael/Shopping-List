package http

import (
	"bytes"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	httphelper "shopping-list/shared/http"
	"testing"
)

type mockRoundTripper struct {
	RoundTripFunc func(req *http.Request) (*http.Response, error)
}

func (m *mockRoundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	return m.RoundTripFunc(req)
}

func mockClient(fn func(req *http.Request) (*http.Response, error)) *http.Client {
	return &http.Client{
		Transport: &mockRoundTripper{
			RoundTripFunc: fn,
		},
	}
}

func MockClientRequest(status int, body string, bodyBytes *[]byte, capturedReq **http.Request) *httphelper.Client {
	return &httphelper.Client{
		HttpClient: mockClient(func(req *http.Request) (*http.Response, error) {
			if capturedReq != nil {
				*capturedReq = req
			}

			if bodyBytes != nil && req.Body != nil {
				b, _ := io.ReadAll(req.Body)
				*bodyBytes = b

				req.Body = io.NopCloser(bytes.NewBuffer(b))
			}

			return &http.Response{
				StatusCode: status,
				Status:     http.StatusText(status),
				Body:       io.NopCloser(bytes.NewBufferString(body)),
				Header:     make(http.Header),
			}, nil
		}),
	}
}

func MockTestFileHeader(t *testing.T) *multipart.FileHeader {
	t.Helper()

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	part, err := writer.CreateFormFile("image", "test.jpg")
	if err != nil {
		t.Fatal(err)
	}

	_, err = part.Write([]byte("fake-image"))
	if err != nil {
		t.Fatal(err)
	}

	err = writer.Close()
	if err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodPost, "/", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	err = req.ParseMultipartForm(1024 * 1024)
	if err != nil {
		t.Fatal(err)
	}

	return req.MultipartForm.File["image"][0]
}

func MockJSONResponse(status int, body []byte) *httphelper.Client {
	return &httphelper.Client{
		HttpClient: mockClient(func(req *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: status,
				Status:     http.StatusText(status),
				Body:       io.NopCloser(bytes.NewBuffer(body)),
				Header:     make(http.Header),
			}, nil
		}),
	}
}

func MockError(err error) *httphelper.Client {
	return &httphelper.Client{
		HttpClient: mockClient(func(req *http.Request) (*http.Response, error) {
			return nil, err
		}),
	}
}
