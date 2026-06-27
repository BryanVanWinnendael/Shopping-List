package services

import (
	"context"
	"encoding/json"
	"errors"
	"testing"

	"shopping-list/shared/contracts"
	"shopping-list/shared/tests"
)

func TestGetLogs(t *testing.T) {
	t.Run("Given valid request, When GetLogs, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.GetLogsResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewLogsService(client, "http://test")

		// when
		res, err := service.GetLogs(context.Background(), "1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When GetLogs, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewLogsService(client, "http://test")

		// when
		res, err := service.GetLogs(context.Background(), "1")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When GetLogs, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.GetLogsResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewLogsService(client, "http://test")

		// when
		res, err := service.GetLogs(context.Background(), "1")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestCreateLog(t *testing.T) {
	t.Run("Given valid request, When CreateLog, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateLogResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewLogsService(client, "http://test")

		req := &contracts.CreateLogRequest{}

		// when
		res, err := service.CreateLog(context.Background(), req)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When CreateLog, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewLogsService(client, "http://test")

		req := &contracts.CreateLogRequest{}

		// when
		res, err := service.CreateLog(context.Background(), req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When CreateLog, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateLogResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewLogsService(client, "http://test")

		req := &contracts.CreateLogRequest{}

		// when
		res, err := service.CreateLog(context.Background(), req)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}

func TestDeleteLogs(t *testing.T) {
	t.Run("Given valid request, When DeleteLogs, Then success", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.DeleteLogResponse{})

		client := tests.MockJSONResponse(200, body)

		service := NewLogsService(client, "http://test")

		// when
		res, err := service.DeleteLogs(context.Background())

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res == nil {
			t.Fatalf("expected response, got nil")
		}
	})

	t.Run("Given http client fails, When DeleteLogs, Then return error", func(t *testing.T) {
		// given
		client := tests.MockError(errors.New("network error"))

		service := NewLogsService(client, "http://test")

		// when
		res, err := service.DeleteLogs(context.Background())

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})

	t.Run("Given API returns error status, When DeleteLogs, Then return error", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.DeleteLogResponse{})

		client := tests.MockJSONResponse(500, body)

		service := NewLogsService(client, "http://test")

		// when
		res, err := service.DeleteLogs(context.Background())

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if res != nil {
			t.Fatalf("expected nil response on error")
		}
	})
}
