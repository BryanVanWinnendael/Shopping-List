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
			&MockCronService{},
			&MockNotificationsService{},
			&MockRecipesService{},
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

	t.Run("Given cron service fails, When GetBackups, Then returns error", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/admin/backups", nil)

		handler := NewAdminHandler(
			&MockCronService{
				GetBackupFunc: func(context.Context) (*http.Response, error) {
					return nil, errors.New("cron failed")
				},
			},
			&MockNotificationsService{},
			&MockRecipesService{},
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
			&MockCronService{},
			&MockNotificationsService{
				GetBackupFunc: func(context.Context) (*http.Response, error) {
					return nil, errors.New("notif failed")
				},
			},
			&MockRecipesService{},
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

	t.Run("Given recipe service fails, When GetBackups, Then returns error", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/admin/backups", nil)

		handler := NewAdminHandler(
			&MockCronService{},
			&MockNotificationsService{},
			&MockRecipesService{
				GetBackupFunc: func(context.Context) (*http.Response, error) {
					return nil, errors.New("recipe failed")
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
