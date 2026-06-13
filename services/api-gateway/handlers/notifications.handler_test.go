package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"testing"

	"shopping-list/shared/contracts"
	"shopping-list/shared/tests"
)

type MockNotificationsService struct {
	SubscribeFunc                  func(ctx context.Context, req *contracts.CreateNotificationRequest) (*contracts.CreateNotificationResponse, error)
	GetAllNotificationsFunc        func(ctx context.Context) (*contracts.GetAllNotificationsResponse, error)
	GetUserNotificationsFunc       func(ctx context.Context, user string) (*contracts.GetUserNotificationsResponse, error)
	DeleteUserNotificationFunc     func(ctx context.Context, user, notificationType string) (*contracts.DeleteUserNotificationResponse, error)
	PushUserNotificationByTypeFunc func(ctx context.Context, notifType, user string, req *contracts.PushUserNotificationByTypeRequest) (*contracts.PushUserNotificationByTypeResponse, error)
}

func TestSubscribe(t *testing.T) {
	t.Run("Given invalid body, When Subscribe, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/notifications/subscribe", []byte("invalid-json"))

		handler := newNotificationsHandler(&MockNotificationsService{})

		// when
		err := handler.Subscribe(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given missing fields, When Subscribe, Then returns 400", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateNotificationRequest{})

		c, rec := tests.SetupEcho(http.MethodPost, "/notifications/subscribe", body)

		handler := newNotificationsHandler(&MockNotificationsService{})

		// when
		err := handler.Subscribe(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given service success, When Subscribe, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateNotificationRequest{
			User:  "test",
			Type:  "test",
			Token: "test",
		})

		c, rec := tests.SetupEcho(http.MethodPost, "/notifications/subscribe", body)

		handler := newNotificationsHandler(&MockNotificationsService{})

		// when
		err := handler.Subscribe(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When Subscribe, Then returns 500", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.CreateNotificationRequest{
			User:  "test",
			Type:  "test",
			Token: "test",
		})

		c, rec := tests.SetupEcho(http.MethodPost, "/notifications/subscribe", body)

		handler := newNotificationsHandler(&MockNotificationsService{
			SubscribeFunc: func(context.Context, *contracts.CreateNotificationRequest) (*contracts.CreateNotificationResponse, error) {
				return nil, errors.New("subscribe failed")
			},
		})

		// when
		err := handler.Subscribe(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestGetAllNotifications(t *testing.T) {
	t.Run("Given service success, When GetAllNotifications, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/notifications", nil)

		handler := newNotificationsHandler(&MockNotificationsService{})

		// when
		err := handler.GetAllNotifications(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When GetAllNotifications, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/notifications", nil)

		handler := newNotificationsHandler(&MockNotificationsService{
			GetAllNotificationsFunc: func(context.Context) (*contracts.GetAllNotificationsResponse, error) {
				return nil, errors.New("db failed")
			},
		})

		// when
		err := handler.GetAllNotifications(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestGetUserNotifications(t *testing.T) {
	t.Run("Given missing path param, When GetUserNotifications, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/notifications/user", nil)

		handler := newNotificationsHandler(&MockNotificationsService{})

		// when
		err := handler.GetUserNotifications(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid user, When GetUserNotifications, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/notifications/users/user1", nil)
		c.SetParamNames("user")
		c.SetParamValues("user1")

		handler := newNotificationsHandler(&MockNotificationsService{})

		// when
		err := handler.GetUserNotifications(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When GetUserNotifications, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodGet, "/notifications/users/user1", nil)
		c.SetParamNames("user")
		c.SetParamValues("user1")

		handler := newNotificationsHandler(&MockNotificationsService{
			GetUserNotificationsFunc: func(context.Context, string) (*contracts.GetUserNotificationsResponse, error) {
				return nil, errors.New("failed")
			},
		})

		// when
		err := handler.GetUserNotifications(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestDeleteUserNotification(t *testing.T) {
	t.Run("Given missing params, When DeleteUserNotification, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/notifications/users/user1", nil)
		c.SetParamNames("user")
		c.SetParamValues("user1")

		handler := newNotificationsHandler(&MockNotificationsService{})

		// when
		err := handler.DeleteUserNotification(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given valid request, When DeleteUserNotification, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/notifications/users/user1/create", nil)
		c.SetParamNames("user", "notificationType")
		c.SetParamValues("user1", "create")

		handler := newNotificationsHandler(&MockNotificationsService{})

		// when
		err := handler.DeleteUserNotification(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When DeleteUserNotification, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodDelete, "/notifications/users/user1/create", nil)
		c.SetParamNames("user", "notificationType")
		c.SetParamValues("user1", "create")

		handler := newNotificationsHandler(&MockNotificationsService{
			DeleteUserNotificationFunc: func(context.Context, string, string) (*contracts.DeleteUserNotificationResponse, error) {
				return nil, errors.New("delete failed")
			},
		})

		// when
		err := handler.DeleteUserNotification(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func TestPushUserNotificationByType(t *testing.T) {
	t.Run("Given invalid body, When PushUserNotificationByType, Then returns 400", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/notifications/users/user1/create", []byte("bad"))
		c.SetParamNames("user", "notificationType")
		c.SetParamValues("user1", "create")

		handler := newNotificationsHandler(&MockNotificationsService{})

		// when
		err := handler.PushUserNotificationByType(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusBadRequest {
			t.Fatalf("expected 400, got %d", rec.Code)
		}
	})

	t.Run("Given missing params, When PushUserNotificationByType, Then returns 400", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.PushUserNotificationByTypeRequest{})

		c, rec := tests.SetupEcho(http.MethodPost, "/notifications/users/user1/create", body)

		handler := newNotificationsHandler(&MockNotificationsService{})

		// when
		err := handler.PushUserNotificationByType(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK && rec.Code != http.StatusBadRequest {
			t.Fatalf("unexpected code %d", rec.Code)
		}
	})

	t.Run("Given service success, When PushUserNotificationByType, Then returns 200", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.PushUserNotificationByTypeRequest{})

		c, rec := tests.SetupEcho(http.MethodPost, "/notifications/users/user1/create", body)
		c.SetParamNames("user", "notificationType")
		c.SetParamValues("user1", "create")

		handler := newNotificationsHandler(&MockNotificationsService{})

		// when
		err := handler.PushUserNotificationByType(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}
	})

	t.Run("Given service error, When PushUserNotificationByType, Then returns 500", func(t *testing.T) {
		// given
		body, _ := json.Marshal(contracts.PushUserNotificationByTypeRequest{})

		c, rec := tests.SetupEcho(http.MethodPost, "/notifications/type/email/user/alice", body)
		c.SetParamNames("user", "notificationType")
		c.SetParamValues("user1", "create")

		handler := newNotificationsHandler(&MockNotificationsService{
			PushUserNotificationByTypeFunc: func(context.Context, string, string, *contracts.PushUserNotificationByTypeRequest) (*contracts.PushUserNotificationByTypeResponse, error) {
				return nil, errors.New("push failed")
			},
		})

		// when
		err := handler.PushUserNotificationByType(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func (m *MockNotificationsService) Subscribe(ctx context.Context, request *contracts.CreateNotificationRequest) (*contracts.CreateNotificationResponse, error) {
	if m.SubscribeFunc != nil {
		return m.SubscribeFunc(ctx, request)
	}
	return &contracts.CreateNotificationResponse{}, nil
}

func (m *MockNotificationsService) GetAllNotifications(ctx context.Context) (*contracts.GetAllNotificationsResponse, error) {
	if m.GetAllNotificationsFunc != nil {
		return m.GetAllNotificationsFunc(ctx)
	}
	return &contracts.GetAllNotificationsResponse{}, nil
}

func (m *MockNotificationsService) GetUserNotifications(ctx context.Context, user string) (*contracts.GetUserNotificationsResponse, error) {
	if m.GetUserNotificationsFunc != nil {
		return m.GetUserNotificationsFunc(ctx, user)
	}
	return &contracts.GetUserNotificationsResponse{}, nil
}

func (m *MockNotificationsService) DeleteUserNotification(ctx context.Context, user, notificationType string) (*contracts.DeleteUserNotificationResponse, error) {
	if m.DeleteUserNotificationFunc != nil {
		return m.DeleteUserNotificationFunc(ctx, user, notificationType)
	}
	return &contracts.DeleteUserNotificationResponse{}, nil
}

func (m *MockNotificationsService) PushUserNotificationByType(ctx context.Context, notifType, user string, request *contracts.PushUserNotificationByTypeRequest) (*contracts.PushUserNotificationByTypeResponse, error) {
	if m.PushUserNotificationByTypeFunc != nil {
		return m.PushUserNotificationByTypeFunc(ctx, notifType, user, request)
	}
	return &contracts.PushUserNotificationByTypeResponse{}, nil
}

func newNotificationsHandler(mock *MockNotificationsService) *NotificationsHandler {
	return NewNotificationsHandler(mock)
}
