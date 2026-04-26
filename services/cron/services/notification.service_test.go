package services

import (
	"errors"
	"shopping-list/shared/tests"
	"testing"
)

func TestSendNotification(t *testing.T) {
	t.Run("Given valid request, When SendNotification, Then success", func(t *testing.T) {
		// given
		client := tests.MockJSONResponse(200, "{}")

		service := NewNotificationService(client, "http://test")

		// when
		err := service.SendNotification("user1", "timed")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Given http client fails, When SendNotification, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewNotificationService(client, "http://test")

		// when
		err := service.SendNotification("user1", "timed")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})

	t.Run("Given API returns error status, When SendNotification, Then return error", func(t *testing.T) {
		// given
		client := tests.MockJSONResponse(500, "{}")

		service := NewNotificationService(client, "http://test")

		// when
		err := service.SendNotification("user1", "timed")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})

	t.Run("Given invalid URL, When SendNotification, Then return error", func(t *testing.T) {
		// given
		service := NewNotificationService(nil, "://bad-url")

		// when
		err := service.SendNotification("user1", "timed")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}
