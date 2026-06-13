package services

import (
	"context"
	"encoding/json"
	"errors"
	"testing"

	"shopping-list/shared/contracts"
	"shopping-list/shared/tests"
)

func TestGetAppLogs(t *testing.T) {
	t.Run("Given valid request, When GetAppLogs, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.GetAppLogsResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewLogsService(client, "http://test")

		// when
		res, err := service.GetAppLogs(context.Background())

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When GetAppLogs, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewLogsService(client, "http://test")

		// when
		res, err := service.GetAppLogs(context.Background())

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When GetAppLogs, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.GetAppLogsResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewLogsService(client, "http://test")

		// when
		res, err := service.GetAppLogs(context.Background())

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestCreateAppLog(t *testing.T) {
	t.Run("Given valid request, When CreateAppLog, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateAppLogResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewLogsService(client, "http://test")

		req := &contracts.CreateAppLogRequest{}

		// when
		res, err := service.CreateAppLog(context.Background(), req)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When CreateAppLog, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewLogsService(client, "http://test")

		req := &contracts.CreateAppLogRequest{}

		// when
		res, err := service.CreateAppLog(context.Background(), req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When CreateAppLog, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateAppLogResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewLogsService(client, "http://test")

		req := &contracts.CreateAppLogRequest{}

		// when
		res, err := service.CreateAppLog(context.Background(), req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestDeleteAppLogs(t *testing.T) {
	t.Run("Given valid request, When DeleteAppLogs, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.DeleteAppLogResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewLogsService(client, "http://test")

		// when
		res, err := service.DeleteAppLogs(context.Background())

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When DeleteAppLogs, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewLogsService(client, "http://test")

		// when
		res, err := service.DeleteAppLogs(context.Background())

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When DeleteAppLogs, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.DeleteAppLogResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewLogsService(client, "http://test")

		// when
		res, err := service.DeleteAppLogs(context.Background())

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}
