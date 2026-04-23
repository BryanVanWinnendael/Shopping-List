package services

import (
	"bytes"
	"io"
	"net/http"
	"testing"
)

type mockRoundTripper struct {
	RoundTripFunc func(req *http.Request) (*http.Response, error)
}

func TestPushNotificationToUser(t *testing.T) {
	t.Run("Given valid request, When PushNotificationToUser, Then no error", func(t *testing.T) {
		// given
		client := newMockClient(func(req *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: 200,
				Status:     "200 OK",
				Body:       io.NopCloser(bytes.NewBuffer([]byte("{}"))),
			}, nil
		})

		service := NewExpoPushService(client)

		// when
		err := service.PushNotificationToUser("token", "title", "body")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Given HTTP client error, When PushNotificationToUser, Then return error", func(t *testing.T) {
		// given
		client := newMockClient(func(req *http.Request) (*http.Response, error) {
			return nil, io.ErrUnexpectedEOF
		})

		service := NewExpoPushService(client)

		// when
		err := service.PushNotificationToUser("token", "title", "body")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})

	t.Run("Given Expo returns 500, When PushNotificationToUser, Then return error", func(t *testing.T) {
		// given
		client := newMockClient(func(req *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: 500,
				Status:     "500 Internal Server Error",
				Body:       io.NopCloser(bytes.NewBuffer([]byte("{}"))),
			}, nil
		})

		service := NewExpoPushService(client)

		// when
		err := service.PushNotificationToUser("token", "title", "body")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})

	t.Run("Given request is created, When PushNotificationToUser, Then correct method and URL used", func(t *testing.T) {
		// given
		var capturedReq *http.Request

		client := newMockClient(func(req *http.Request) (*http.Response, error) {
			capturedReq = req
			return &http.Response{
				StatusCode: 200,
				Status:     "200 OK",
				Body:       io.NopCloser(bytes.NewBuffer([]byte("{}"))),
			}, nil
		})

		service := NewExpoPushService(client)

		// when
		err := service.PushNotificationToUser("token", "title", "body")

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if capturedReq.Method != http.MethodPost {
			t.Fatalf("expected POST, got %s", capturedReq.Method)
		}

		expectedURL := "https://exp.host/--/api/v2/push/send"
		if capturedReq.URL.String() != expectedURL {
			t.Fatalf("expected URL %s, got %s", expectedURL, capturedReq.URL.String())
		}
	})

	t.Run("Given payload is sent, When PushNotificationToUser, Then body contains expected data", func(t *testing.T) {
		// given
		var bodyBytes []byte

		client := newMockClient(func(req *http.Request) (*http.Response, error) {
			bodyBytes, _ = io.ReadAll(req.Body)

			return &http.Response{
				StatusCode: 200,
				Status:     "200 OK",
				Body:       io.NopCloser(bytes.NewBuffer([]byte("{}"))),
			}, nil
		})

		service := NewExpoPushService(client)

		// when
		err := service.PushNotificationToUser("token123", "hello", "world")

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		bodyStr := string(bodyBytes)

		if !bytes.Contains(bodyBytes, []byte("token123")) {
			t.Fatalf("expected token in body, got %s", bodyStr)
		}
		if !bytes.Contains(bodyBytes, []byte("hello")) {
			t.Fatalf("expected title in body, got %s", bodyStr)
		}
		if !bytes.Contains(bodyBytes, []byte("world")) {
			t.Fatalf("expected body in body, got %s", bodyStr)
		}
	})
}

func (m *mockRoundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	return m.RoundTripFunc(req)
}

func newMockClient(fn func(req *http.Request) (*http.Response, error)) *http.Client {
	return &http.Client{
		Transport: &mockRoundTripper{
			RoundTripFunc: fn,
		},
	}
}
