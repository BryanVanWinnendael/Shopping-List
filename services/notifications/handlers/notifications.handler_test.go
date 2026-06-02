package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"shopping-list/shared/contracts"
	"shopping-list/shared/models"
	"shopping-list/shared/tests"
	"testing"
)

type MockNotificationsService struct {
	SubscribeFunc                  func(request *contracts.CreateNotificationRequest) (*contracts.CreateNotificationResponse, error)
	GetAllNotificationsFunc        func() (*contracts.GetAllNotificationsResponse, error)
	GetUserNotificationsFunc       func(user string) (*contracts.GetUserNotificationsResponse, error)
	UnsubscribeFunc                func(user string, notifType models.NotificationType) (*contracts.DeleteUserNotificationResponse, error)
	PushUserNotificationByTypeFunc func(notifType models.NotificationType, user string, request *contracts.PushUserNotificationByTypeRequest) (*contracts.PushUserNotificationByTypeResponse, error)
}

func TestSubscribe(t *testing.T) {
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
		body, _ := json.Marshal(contracts.CreateNotificationRequest{})
		c, rec := tests.SetupEcho(http.MethodPost, "/notifications", body)

		handler := NewNotificationsHandler(&MockNotificationsService{
			SubscribeFunc: func(*contracts.CreateNotificationRequest) (*contracts.CreateNotificationResponse, error) {
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
		body, _ := json.Marshal(contracts.CreateNotificationRequest{})
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

func TestPushUserNotificationByType(t *testing.T) {
	t.Run("Given missing params, When PushUserNotificationByType, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/push", nil)
		handler := NewNotificationsHandler(&MockNotificationsService{})

		// when
		_ = handler.PushUserNotificationByType(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given invalid body, When PushUserNotificationByType, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/push", []byte("{invalid"))
		c.SetParamNames("type", "user")
		c.SetParamValues("a", "b")

		handler := NewNotificationsHandler(&MockNotificationsService{})

		// when
		_ = handler.PushUserNotificationByType(c)

		// then
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When PushUserNotificationByType, Then returns 500", func(t *testing.T) {
		// given
		body := []byte(`{"env":"prod"}`)
		c, rec := tests.SetupEcho(http.MethodPost, "/push", body)
		c.SetParamNames("type", "user")
		c.SetParamValues("a", "b")

		handler := NewNotificationsHandler(&MockNotificationsService{
			PushUserNotificationByTypeFunc: func(models.NotificationType, string, *contracts.PushUserNotificationByTypeRequest) (*contracts.PushUserNotificationByTypeResponse, error) {
				return nil, errors.New("fail")
			},
		})

		// when
		_ = handler.PushUserNotificationByType(c)

		// then
		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When PushUserNotificationByType, Then returns 200", func(t *testing.T) {
		// given
		body := []byte(`{"env":"prod"}`)
		c, rec := tests.SetupEcho(http.MethodPost, "/push", body)
		c.SetParamNames("type", "user")
		c.SetParamValues("a", "b")

		handler := NewNotificationsHandler(&MockNotificationsService{})

		// when
		_ = handler.PushUserNotificationByType(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestGetAllNotifications(t *testing.T) {
	t.Run("Given service error, When GetAllNotifications, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/notifications", nil)

		handler := NewNotificationsHandler(&MockNotificationsService{
			GetAllNotificationsFunc: func() (*contracts.GetAllNotificationsResponse, error) {
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

		handler := NewNotificationsHandler(&MockNotificationsService{})

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
			GetUserNotificationsFunc: func(string) (*contracts.GetUserNotificationsResponse, error) {
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

		handler := NewNotificationsHandler(&MockNotificationsService{})

		// when
		_ = handler.GetUserNotifications(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func TestUnsubscribe(t *testing.T) {
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
			UnsubscribeFunc: func(string, models.NotificationType) (*contracts.DeleteUserNotificationResponse, error) {
				return nil, errors.New("not found")
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

		handler := NewNotificationsHandler(&MockNotificationsService{})

		// when
		_ = handler.Unsubscribe(c)

		// then
		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})
}

func (m *MockNotificationsService) Subscribe(request *contracts.CreateNotificationRequest) (*contracts.CreateNotificationResponse, error) {
	if m.SubscribeFunc != nil {
		return m.SubscribeFunc(request)
	}
	return &contracts.CreateNotificationResponse{
		Id:    "1",
		Token: request.Token,
		Type:  request.Type,
		User:  request.User,
	}, nil
}

func (m *MockNotificationsService) GetAllNotifications() (*contracts.GetAllNotificationsResponse, error) {
	if m.GetAllNotificationsFunc != nil {
		return m.GetAllNotificationsFunc()
	}
	return &contracts.GetAllNotificationsResponse{
		{
			Id:    "1",
			User:  "user1",
			Type:  "type1",
			Token: "token1",
		},
		{
			Id:    "2",
			User:  "user2",
			Type:  "type2",
			Token: "token2",
		},
	}, nil
}

func (m *MockNotificationsService) GetUserNotifications(user string) (*contracts.GetUserNotificationsResponse, error) {
	if m.GetUserNotificationsFunc != nil {
		return m.GetUserNotificationsFunc(user)
	}
	return &contracts.GetUserNotificationsResponse{
		{
			Id:    "1",
			User:  user,
			Type:  "type1",
			Token: "token1",
		},
	}, nil
}

func (m *MockNotificationsService) Unsubscribe(user string, notifType models.NotificationType) (*contracts.DeleteUserNotificationResponse, error) {
	if m.UnsubscribeFunc != nil {
		return m.UnsubscribeFunc(user, notifType)
	}
	return &contracts.DeleteUserNotificationResponse{
		User: user,
		Type: notifType,
	}, nil
}

func (m *MockNotificationsService) PushUserNotificationByType(notifType models.NotificationType, user string, request *contracts.PushUserNotificationByTypeRequest) (*contracts.PushUserNotificationByTypeResponse, error) {
	if m.PushUserNotificationByTypeFunc != nil {
		return m.PushUserNotificationByTypeFunc(notifType, user, request)
	}
	return &contracts.PushUserNotificationByTypeResponse{
		Type:    models.NotificationType(notifType),
		User:    user,
		Message: "Notification sent",
	}, nil
}
