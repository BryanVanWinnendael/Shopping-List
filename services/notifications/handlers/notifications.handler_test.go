package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"shopping-list/shared/tests"
	"testing"

	"shopping-list/notifications/models"
)

type MockNotificationsService struct {
	CreateFunc   func(*models.NotificationCreate) (*models.Notification, error)
	GetAllFunc   func() ([]models.Notification, error)
	GetUserFunc  func(string) ([]models.Notification, error)
	DeleteFunc   func(string, string) error
	SendPushFunc func(string, string, string) error
}

func TestAdd(t *testing.T) {
	t.Run("Given invalid body, When Subscribe, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/notifications", []byte("invalid"))
		handler := NewNotificationsHandler(&MockNotificationsService{})

		// when
		_ = handler.Subscribe(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When Subscribe, Then returns 500", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.NotificationCreate{})
		c, rec := tests.SetupEcho(http.MethodPost, "/notifications", body)

		handler := NewNotificationsHandler(&MockNotificationsService{
			CreateFunc: func(n *models.NotificationCreate) (*models.Notification, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		_ = handler.Subscribe(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When Subscribe, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(models.NotificationCreate{})
		c, rec := tests.SetupEcho(http.MethodPost, "/notifications", body)

		handler := NewNotificationsHandler(&MockNotificationsService{})

		// when
		_ = handler.Subscribe(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestSendPushByType(t *testing.T) {
	t.Run("Given missing params, When SendPushByType, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/push", nil)
		handler := NewNotificationsHandler(&MockNotificationsService{})

		// when
		_ = handler.SendPushByType(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given invalid body, When SendPushByType, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/push", []byte("{invalid"))
		c.SetParamNames("type", "user")
		c.SetParamValues("a", "b")

		handler := NewNotificationsHandler(&MockNotificationsService{})

		// when
		_ = handler.SendPushByType(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When SendPushByType, Then returns 500", func(t *testing.T) {
		// given
		body := []byte(`{"env":"prod"}`)
		c, rec := tests.SetupEcho(http.MethodPost, "/push", body)
		c.SetParamNames("type", "user")
		c.SetParamValues("a", "b")

		handler := NewNotificationsHandler(&MockNotificationsService{
			SendPushFunc: func(t, u, e string) error {
				return errors.New("fail")
			},
		})

		// when
		_ = handler.SendPushByType(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When SendPushByType, Then returns 200", func(t *testing.T) {
		// given
		body := []byte(`{"env":"prod"}`)
		c, rec := tests.SetupEcho(http.MethodPost, "/push", body)
		c.SetParamNames("type", "user")
		c.SetParamValues("a", "b")

		handler := NewNotificationsHandler(&MockNotificationsService{})

		// when
		_ = handler.SendPushByType(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestGetAll(t *testing.T) {
	t.Run("Given service error, When GetAllNotifications, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/notifications", nil)

		handler := NewNotificationsHandler(&MockNotificationsService{
			GetAllFunc: func() ([]models.Notification, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		_ = handler.GetAllNotifications(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given valid data, When GetAllNotifications, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/notifications", nil)

		handler := NewNotificationsHandler(&MockNotificationsService{
			GetAllFunc: func() ([]models.Notification, error) {
				return []models.Notification{
					{ID: "1"},
				}, nil
			},
		})

		// when
		_ = handler.GetAllNotifications(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestGetUserNotifications(t *testing.T) {
	t.Run("Given service error, When GetUserNotifications, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/notifications/user1", nil)
		c.SetParamNames("user")
		c.SetParamValues("user1")

		handler := NewNotificationsHandler(&MockNotificationsService{
			GetUserFunc: func(userID string) ([]models.Notification, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		_ = handler.GetUserNotifications(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given valid user, When GetUserNotifications, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/notifications/user1", nil)
		c.SetParamNames("user")
		c.SetParamValues("user1")

		handler := NewNotificationsHandler(&MockNotificationsService{
			GetUserFunc: func(userID string) ([]models.Notification, error) {
				return []models.Notification{
					{User: userID},
				}, nil
			},
		})

		// when
		_ = handler.GetUserNotifications(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestDelete(t *testing.T) {
	t.Run("Given missing params, When Unsubscribe, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/notifications", nil)

		handler := NewNotificationsHandler(&MockNotificationsService{})

		// when
		_ = handler.Unsubscribe(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When Unsubscribe, Then returns 404", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/notifications/a/b", nil)
		c.SetParamNames("type", "user")
		c.SetParamValues("a", "b")

		handler := NewNotificationsHandler(&MockNotificationsService{
			DeleteFunc: func(user, notifType string) error {
				return errors.New("not found")
			},
		})

		// when
		_ = handler.Unsubscribe(c)

		// then
		if rec.Code != http.StatusNotFound {
			t.Fatalf("expected 404, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When Unsubscribe, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/notifications/a/b", nil)
		c.SetParamNames("type", "user")
		c.SetParamValues("a", "b")

		handler := NewNotificationsHandler(&MockNotificationsService{
			DeleteFunc: func(user, notifType string) error {
				return nil
			},
		})

		// when
		_ = handler.Unsubscribe(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func (m *MockNotificationsService) Subscribe(n *models.NotificationCreate) (*models.Notification, error) {
	if m.CreateFunc != nil {
		return m.CreateFunc(n)
	}
	return &models.Notification{ID: "1"}, nil
}

func (m *MockNotificationsService) GetAllNotifications() ([]models.Notification, error) {
	if m.GetAllFunc != nil {
		return m.GetAllFunc()
	}
	return []models.Notification{}, nil
}

func (m *MockNotificationsService) GetUserNotifications(userID string) ([]models.Notification, error) {
	if m.GetUserFunc != nil {
		return m.GetUserFunc(userID)
	}
	return []models.Notification{}, nil
}

func (m *MockNotificationsService) DeleteNotification(user, notifType string) error {
	if m.DeleteFunc != nil {
		return m.DeleteFunc(user, notifType)
	}
	return nil
}

func (m *MockNotificationsService) SendPushNotification(t, u, e string) error {
	if m.SendPushFunc != nil {
		return m.SendPushFunc(t, u, e)
	}
	return nil
}
