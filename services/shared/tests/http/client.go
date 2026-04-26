package http

import (
	"bytes"
	"io"
	"net/http"
	httphelper "shopping-list/shared/http"
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

func MockClientRequest(
	status int,
	body string,
	bodyBytes *[]byte,
	capturedReq **http.Request,
) *httphelper.Client {
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

func MockJSONResponse(status int, body string) *httphelper.Client {
	return &httphelper.Client{
		HttpClient: mockClient(func(req *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: status,
				Status:     http.StatusText(status),
				Body:       io.NopCloser(bytes.NewBufferString(body)),
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
