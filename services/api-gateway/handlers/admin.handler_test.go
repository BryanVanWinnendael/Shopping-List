package handlers

import (
	"context"
	"errors"
	"net/http"
	"shopping-list/shared/tests"
	"testing"
)

func TestGetBackups(t *testing.T) {
	t.Run("Given all services succeed, When GetBackups, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/admin/backups", nil)

		handler := NewAdminHandler(
			&MockCategoryModelService{},
			&MockCronService{},
			&MockLogsService{},
			&MockNotificationsService{},
			&MockProductsSearchService{},
			&MockRecipesService{},
			&MockStorageService{},
		)

		// when
		err := handler.GetBackups(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200 (or streamed), got %d", rec.Code)
		}
	})

	t.Run("Given category model service fails, When GetBackups, Then returns error", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/admin/backups", nil)

		handler := NewAdminHandler(
			&MockCategoryModelService{
				GetBackupFunc: func(context.Context) (*http.Response, error) {
					return nil, errors.New("category model failed")
				},
			},
			&MockCronService{},
			&MockLogsService{},
			&MockNotificationsService{},
			&MockProductsSearchService{},
			&MockRecipesService{},
			&MockStorageService{},
		)

		// when
		err := handler.GetBackups(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given cron service fails, When GetBackups, Then returns error", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/admin/backups", nil)

		handler := NewAdminHandler(
			&MockCategoryModelService{},
			&MockCronService{
				GetBackupFunc: func(context.Context) (*http.Response, error) {
					return nil, errors.New("cron failed")
				},
			},
			&MockLogsService{},
			&MockNotificationsService{},
			&MockProductsSearchService{},
			&MockRecipesService{},
			&MockStorageService{},
		)

		// when
		err := handler.GetBackups(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given logs service fails, When GetBackups, Then returns error", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/admin/backups", nil)

		handler := NewAdminHandler(
			&MockCategoryModelService{},
			&MockCronService{},
			&MockLogsService{
				GetBackupFunc: func(context.Context) (*http.Response, error) {
					return nil, errors.New("logs failed")
				},
			},
			&MockNotificationsService{},
			&MockProductsSearchService{},
			&MockRecipesService{},
			&MockStorageService{},
		)

		// when
		err := handler.GetBackups(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given notifications service fails, When GetBackups, Then returns error", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/admin/backups", nil)

		handler := NewAdminHandler(
			&MockCategoryModelService{},
			&MockCronService{},
			&MockLogsService{},
			&MockNotificationsService{
				GetBackupFunc: func(context.Context) (*http.Response, error) {
					return nil, errors.New("notifications failed")
				},
			},
			&MockProductsSearchService{},
			&MockRecipesService{},
			&MockStorageService{},
		)

		// when
		err := handler.GetBackups(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given products search service fails, When GetBackups, Then returns error", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/admin/backups", nil)

		handler := NewAdminHandler(
			&MockCategoryModelService{},
			&MockCronService{},
			&MockLogsService{},
			&MockNotificationsService{},
			&MockProductsSearchService{
				GetBackupFunc: func(context.Context) (*http.Response, error) {
					return nil, errors.New("products search failed")
				},
			},
			&MockRecipesService{},
			&MockStorageService{},
		)

		// when
		err := handler.GetBackups(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given recipes service fails, When GetBackups, Then returns error", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/admin/backups", nil)

		handler := NewAdminHandler(
			&MockCategoryModelService{},
			&MockCronService{},
			&MockLogsService{},
			&MockNotificationsService{},
			&MockProductsSearchService{},
			&MockRecipesService{
				GetBackupFunc: func(context.Context) (*http.Response, error) {
					return nil, errors.New("recipes failed")
				},
			},
			&MockStorageService{},
		)

		// when
		err := handler.GetBackups(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given storage service fails, When GetBackups, Then returns error", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/admin/backups", nil)

		handler := NewAdminHandler(
			&MockCategoryModelService{},
			&MockCronService{},
			&MockLogsService{},
			&MockNotificationsService{},
			&MockProductsSearchService{},
			&MockRecipesService{},
			&MockStorageService{
				GetBackupFunc: func(context.Context) (*http.Response, error) {
					return nil, errors.New("storage failed")
				},
			},
		)

		// when
		err := handler.GetBackups(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})
}
