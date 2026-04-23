package services

import (
	"shopping-list/notifications/internal/config"
	"shopping-list/notifications/models"
	"shopping-list/shared/tests"
	"testing"

	"go.etcd.io/bbolt"
)

type MockExpo struct {
	SendFunc func(token, title, body string) error
}

func TestCreateNotification(t *testing.T) {
	t.Run("Given valid data, When Subscribe, Then store and return notification", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewNotificationsService(db, &MockExpo{})

		data := &models.NotificationCreate{
			User:  "user1",
			Type:  "added",
			Token: "token123",
		}

		// when
		notif, err := service.Subscribe(data)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if notif.ID == "" {
			t.Fatalf("expected ID to be generated")
		}
	})
}

func TestGetNotification(t *testing.T) {
	t.Run("Given existing notification, When GetNotification, Then return it", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewNotificationsService(db, &MockExpo{})

		notification := models.Notification{ID: "1", User: "user1", Type: "added"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), notification)

		// when
		result, err := service.GetNotification("1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if result.ID != "1" {
			t.Fatalf("expected ID 1")
		}
	})

	t.Run("Given missing notification, When GetNotification, Then return error", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewNotificationsService(db, &MockExpo{})

		// when
		_, err := service.GetNotification("missing")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}

func TestGetAllNotifications(t *testing.T) {
	t.Run("Given notifications in DB, When GetAllNotifications, Then return list", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewNotificationsService(db, &MockExpo{})

		notification := models.Notification{ID: "1", User: "user1"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), notification)

		// when
		list, err := service.GetAllNotifications()

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if len(list) != 1 {
			t.Fatalf("expected 1 notification")
		}
	})
}

func TestGetUserNotifications(t *testing.T) {
	t.Run("Given multiple notifications, When GetUserNotifications, Then return user notifications", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewNotificationsService(db, &MockExpo{})

		notification1 := models.Notification{ID: "1", User: "user1"}
		notification2 := models.Notification{ID: "2", User: "user2"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), notification1)
		tests.Put(t, db, config.Vars.Bucket, []byte("2"), notification2)

		// when
		list, err := service.GetUserNotifications("user1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if len(list) != 1 {
			t.Fatalf("expected 1 notification")
		}
	})
}

func TestDeleteNotification(t *testing.T) {
	t.Run("Given existing notification, When DeleteNotification, Then success", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewNotificationsService(db, &MockExpo{})

		notification := models.Notification{ID: "1", User: "user1", Type: "added"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), notification)

		// when
		err := service.DeleteNotification("user1", "added")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Given missing notification, When DeleteNotification, Then return error", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewNotificationsService(db, &MockExpo{})

		// when
		err := service.DeleteNotification("user1", "added")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}

func TestSendPushNotification(t *testing.T) {
	t.Run("Given notifications, When SendPushNotification, Then send push", func(t *testing.T) {
		// given
		db := setup(t)

		mockExpo := &MockExpo{
			SendFunc: func(token, title, body string) error {
				return nil
			},
		}

		service := NewNotificationsService(db, mockExpo)

		notification := models.Notification{
			ID:    "1",
			User:  "user1",
			Type:  "added",
			Token: "token123",
		}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), notification)

		// when
		err := service.SendPushNotification("added", "user1", "")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Given dev env, When SendPushNotification, Then use dev path", func(t *testing.T) {
		// given
		db := setup(t)

		mockExpo := &MockExpo{
			SendFunc: func(token, title, body string) error {
				return nil
			},
		}

		service := NewNotificationsService(db, mockExpo)

		notification := models.Notification{
			ID:    "1",
			User:  "user1",
			Type:  "added",
			Token: "token123",
		}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), notification)

		// when
		err := service.SendPushNotification("added", "user1", "dev")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})
}

func (m *MockExpo) SendPushToUser(token, title, body string) error {
	if m.SendFunc != nil {
		return m.SendFunc(token, title, body)
	}
	return nil
}

func setup(t *testing.T) *bbolt.DB {
	config.Vars.Bucket = "test-bucket"
	db := tests.SetupDB(t, "test.db", "test-bucket")
	return db
}
