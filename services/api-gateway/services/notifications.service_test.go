package services

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"testing"

	"shopping-list/shared/contracts"
	"shopping-list/shared/tests"
)

func TestSubscribe(t *testing.T) {
	t.Run("Given valid request, When Subscribe, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateNotificationResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewNotificationsService(client, "http://test")

		req := &contracts.CreateNotificationRequest{}

		// when
		res, err := service.Subscribe(context.Background(), req)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When Subscribe, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewNotificationsService(client, "http://test")

		req := &contracts.CreateNotificationRequest{}

		// when
		res, err := service.Subscribe(context.Background(), req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When Subscribe, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateNotificationResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewNotificationsService(client, "http://test")

		req := &contracts.CreateNotificationRequest{}

		// when
		res, err := service.Subscribe(context.Background(), req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestGetAllNotifications(t *testing.T) {
	t.Run("Given valid request, When GetAllNotifications, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.GetAllNotificationsResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewNotificationsService(client, "http://test")

		// when
		res, err := service.GetAllNotifications(context.Background())

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When GetAllNotifications, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewNotificationsService(client, "http://test")

		// when
		res, err := service.GetAllNotifications(context.Background())

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When GetAllNotifications, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.GetAllNotificationsResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewNotificationsService(client, "http://test")

		// when
		res, err := service.GetAllNotifications(context.Background())

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestGetUserNotifications(t *testing.T) {
	t.Run("Given valid request, When GetUserNotifications, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.GetUserNotificationsResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewNotificationsService(client, "http://test")

		// when
		res, err := service.GetUserNotifications(context.Background(), "user1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When GetUserNotifications, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewNotificationsService(client, "http://test")

		// when
		res, err := service.GetUserNotifications(context.Background(), "user1")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When GetUserNotifications, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.GetUserNotificationsResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewNotificationsService(client, "http://test")

		// when
		res, err := service.GetUserNotifications(context.Background(), "user1")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestDeleteUserNotification(t *testing.T) {
	t.Run("Given valid request, When DeleteUserNotification, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.DeleteUserNotificationResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewNotificationsService(client, "http://test")

		// when
		res, err := service.DeleteUserNotification(context.Background(), "user1", "shopping")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When DeleteUserNotification, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewNotificationsService(client, "http://test")

		// when
		res, err := service.DeleteUserNotification(context.Background(), "user1", "shopping")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When DeleteUserNotification, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.DeleteUserNotificationResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewNotificationsService(client, "http://test")

		// when
		res, err := service.DeleteUserNotification(context.Background(), "user1", "shopping")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestPushUserNotificationByType(t *testing.T) {
	t.Run("Given valid request, When PushUserNotificationByType, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.PushUserNotificationByTypeResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewNotificationsService(client, "http://test")

		req := &contracts.PushUserNotificationByTypeRequest{}

		// when
		res, err := service.PushUserNotificationByType(context.Background(), "shopping", "user1", req)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When PushUserNotificationByType, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewNotificationsService(client, "http://test")

		req := &contracts.PushUserNotificationByTypeRequest{}

		// when
		res, err := service.PushUserNotificationByType(context.Background(), "shopping", "user1", req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When PushUserNotificationByType, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.PushUserNotificationByTypeResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewNotificationsService(client, "http://test")

		req := &contracts.PushUserNotificationByTypeRequest{}

		// when
		res, err := service.PushUserNotificationByType(context.Background(), "shopping", "user1", req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

}

func TestGetNotificationsBackup(t *testing.T) {
	t.Run("Given valid request, When GetBackup, Then success", func(t *testing.T) {
		// given
		expectedBody := []byte("fake-binary-db-content")

		client := tests.MockRawResponse(200, expectedBody, map[string]string{
			"Content-Type":        "application/octet-stream",
			"Content-Disposition": `attachment; filename="backup.db"`,
		})

		service := NewNotificationsService(client, "http://test")

		// when
		res, err := service.GetBackup(context.Background())

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if res == nil {
			t.Fatalf("expected response, got nil")
		}

		defer func(Body io.ReadCloser) {
			err := Body.Close()
			if err != nil {
				t.Fatalf("failed to close response body: %v", err)
			}
		}(res.Body)

		body, err := io.ReadAll(res.Body)
		if err != nil {
			t.Fatalf("failed to read body: %v", err)
		}

		if string(body) != string(expectedBody) {
			t.Fatalf("expected %s, got %s", expectedBody, body)
		}

		if res.Header.Get("Content-Type") != "application/octet-stream" {
			t.Fatalf("expected content-type application/octet-stream, got %s", res.Header.Get("Content-Type"))
		}
	})

	t.Run("Given http client fails, When GetBackup, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewNotificationsService(client, "http://test")

		// when
		res, err := service.GetBackup(context.Background())

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error, When GetBackup, Then return error", func(t *testing.T) {
		// given
		client := tests.MockRawResponse(500, []byte("internal error"), nil)

		service := NewNotificationsService(client, "http://test")

		// when
		res, err := service.GetBackup(context.Background())

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}
