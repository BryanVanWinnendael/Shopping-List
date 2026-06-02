package services

import (
	"shopping-list/notifications/internal/config"
	"shopping-list/shared/contracts"
	"shopping-list/shared/models"
	"shopping-list/shared/tests"
	"testing"

	"go.etcd.io/bbolt"
)

type MockExpo struct {
	PushNotificationToUserFunc func(token, title, body string) error
}

func TestSubscribe(t *testing.T) {
	t.Run("Given valid data, When Subscribe, Then store and return notification", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewNotificationsService(db, &MockExpo{})

		data := contracts.CreateNotificationRequest{
			User:  "user1",
			Type:  "added",
			Token: "token123",
		}

		// when
		notif, err := service.Subscribe(&data)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if notif.Id == "" {
			t.Fatalf("expected ID to be generated")
		}
	})
}

func TestGetAllNotifications(t *testing.T) {
	t.Run("Given notifications in DB, When GetAllNotifications, Then return list", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewNotificationsService(db, &MockExpo{})

		notification := models.Notification{Id: "1", User: "user1"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), notification)

		// when
		list, err := service.GetAllNotifications()

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if len(*list) != 1 {
			t.Fatalf("expected 1 notification")
		}
	})
}

func TestGetUserNotifications(t *testing.T) {
	t.Run("Given multiple notifications, When GetUserNotifications, Then return user notifications", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewNotificationsService(db, &MockExpo{})

		notification1 := models.Notification{Id: "1", User: "user1"}
		notification2 := models.Notification{Id: "2", User: "user2"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), notification1)
		tests.Put(t, db, config.Vars.Bucket, []byte("2"), notification2)

		// when
		list, err := service.GetUserNotifications("user1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if len(*list) != 1 {
			t.Fatalf("expected 1 notification")
		}
	})
}

func TestUnsubscribe(t *testing.T) {
	t.Run("Given existing notification, When Unsubscribe, Then success", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewNotificationsService(db, &MockExpo{})

		notification := models.Notification{Id: "1", User: "user1", Type: "added"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), notification)

		nt := models.NotificationType("added")

		// when
		result, err := service.Unsubscribe("user1", nt)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if result == nil {
			t.Fatalf("expected result")
		}

		if result.Message != "notification unsubscribed" {
			t.Fatalf("expected notification unsubscribed, got %s", result.Message)
		}
	})

	t.Run("Given missing notification, When Unsubscribe, Then return error", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewNotificationsService(db, &MockExpo{})

		// when
		result, err := service.Unsubscribe("user1", "added")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		if result != nil {
			t.Fatalf("no result expected")
		}
	})
}

func TestPushUserNotificationByType(t *testing.T) {
	t.Run("Given notifications, When PushUserNotificationByType, Then send push", func(t *testing.T) {
		// given
		db := setup(t)

		mockExpo := &MockExpo{
			PushNotificationToUserFunc: func(token, title, body string) error {
				return nil
			},
		}

		service := NewNotificationsService(db, mockExpo)

		notification := models.Notification{
			Id:    "1",
			User:  "user1",
			Type:  "added",
			Token: "token123",
		}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), notification)
		request := contracts.PushUserNotificationByTypeRequest{}

		// when
		result, err := service.PushUserNotificationByType("added", "user1", &request)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if result == nil {
			t.Fatalf("expected result")
		}

		if result.Message != "notification pushed to user" {
			t.Fatalf("expected Notification pushed to user, got %s", result.Message)
		}
	})

	t.Run("Given dev env, When PushUserNotificationByType, Then use dev path", func(t *testing.T) {
		// given
		db := setup(t)

		mockExpo := &MockExpo{
			PushNotificationToUserFunc: func(token, title, body string) error {
				return nil
			},
		}

		service := NewNotificationsService(db, mockExpo)

		notification := models.Notification{
			Id:    "1",
			User:  "user1",
			Type:  "added",
			Token: "token123",
		}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), notification)
		request := contracts.PushUserNotificationByTypeRequest{
			Env: "dev",
		}

		// when
		result, err := service.PushUserNotificationByType("added", "user1", &request)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if result == nil {
			t.Fatalf("expected result")
		}

		if result.Message != "[DEV] notification pushed to user" {
			t.Fatalf("expected [DEV] notification pushed to user, got %s", result.Message)
		}
	})

	t.Run("Given user All and text provided, When PushUserNotificationByType, Then send to all users", func(t *testing.T) {
		// given
		db := setup(t)

		called := 0

		mockExpo := &MockExpo{
			PushNotificationToUserFunc: func(token, title, body string) error {
				called++
				return nil
			},
		}

		service := NewNotificationsService(db, mockExpo)

		notification1 := models.Notification{
			Id:    "1",
			User:  "user1",
			Type:  "added",
			Token: "token1",
		}

		notification2 := models.Notification{
			Id:    "2",
			User:  "user2",
			Type:  "added",
			Token: "token2",
		}

		tests.Put(t, db, config.Vars.Bucket, []byte("1"), notification1)
		tests.Put(t, db, config.Vars.Bucket, []byte("2"), notification2)

		request := &contracts.PushUserNotificationByTypeRequest{
			Text: "Hello everyone 👋",
		}

		// when
		result, err := service.PushUserNotificationByType("added", "All", request)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if result == nil {
			t.Fatalf("expected result")
		}

		if result.Message != "notification pushed to all users" {
			t.Fatalf("expected all users message, got %s", result.Message)
		}

		if called == 0 {
			t.Fatalf("expected notifications to be sent")
		}
	})
}

func (m *MockExpo) PushNotificationToUser(token, title, body string) error {
	if m.PushNotificationToUserFunc != nil {
		return m.PushNotificationToUserFunc(token, title, body)
	}
	return nil
}

func setup(t *testing.T) *bbolt.DB {
	config.Vars.Bucket = "test-bucket"
	db := tests.SetupDB(t, "test.db", "test-bucket")
	return db
}
