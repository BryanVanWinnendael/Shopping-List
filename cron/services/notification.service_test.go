package services

import (
	"errors"
	"io"
	"net/http"
	"strings"
	"testing"

	"shopping-list/cron/internal/config"
)

type MockRoundTripper struct {
	RoundTripFunc func(req *http.Request) (*http.Response, error)
}

func (m *MockRoundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	return m.RoundTripFunc(req)
}

func TestSendNotification(t *testing.T) {
	t.Run("Given valid request, When SendNotification, Then success", func(t *testing.T) {
		// given
		config.Vars.NotificationsAPIUrl = "http://test"

		mockTransport := &MockRoundTripper{
			RoundTripFunc: func(req *http.Request) (*http.Response, error) {
				return &http.Response{
					StatusCode: 200,
					Status:     "200 OK",
					Body:       io.NopCloser(strings.NewReader("ok")),
				}, nil
			},
		}

		client := &http.Client{Transport: mockTransport}
		service := NewNotificationService(client)

		// when
		err := service.SendNotification("user1", "timed")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Given http client fails, When SendNotification, Then return error", func(t *testing.T) {
		// given
		config.Vars.NotificationsAPIUrl = "http://test"

		mockTransport := &MockRoundTripper{
			RoundTripFunc: func(req *http.Request) (*http.Response, error) {
				return nil, errors.New("network error")
			},
		}

		client := &http.Client{Transport: mockTransport}
		service := NewNotificationService(client)

		// when
		err := service.SendNotification("user1", "timed")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})

	t.Run("Given API returns error status, When SendNotification, Then return error", func(t *testing.T) {
		// given
		config.Vars.NotificationsAPIUrl = "http://test"

		mockTransport := &MockRoundTripper{
			RoundTripFunc: func(req *http.Request) (*http.Response, error) {
				return &http.Response{
					StatusCode: 500,
					Status:     "500 Internal Server Error",
					Body:       io.NopCloser(strings.NewReader("error")),
				}, nil
			},
		}

		client := &http.Client{Transport: mockTransport}
		service := NewNotificationService(client)

		// when
		err := service.SendNotification("user1", "timed")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})

	t.Run("Given invalid URL, When SendNotification, Then return error", func(t *testing.T) {
		// given
		config.Vars.NotificationsAPIUrl = "://bad-url"

		service := NewNotificationService(nil)

		// when
		err := service.SendNotification("user1", "timed")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}
