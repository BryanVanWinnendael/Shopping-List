package services

import (
	"encoding/json"
	"os"
	"shopping-list/notifications/internal/config"
	"shopping-list/notifications/models"
	"testing"

	"go.etcd.io/bbolt"
)

type MockExpo struct {
	SendFunc func(token, title, body string) error
}

const tmpDB = "test.db"

func TestCreateNotification(t *testing.T) {
	t.Run("Given valid data, When CreateNotification, Then store and return notification", func(t *testing.T) {
		// given
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := NewNotificationsService(db, &MockExpo{})

		data := &models.NotificationCreate{
			User:  "user1",
			Type:  "added",
			Token: "token123",
		}

		// when
		notif, err := service.CreateNotification(data)

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
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := NewNotificationsService(db, &MockExpo{})

		n := models.Notification{ID: "1", User: "user1", Type: "added"}
		data, _ := json.Marshal(n)

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			return tx.Bucket([]byte(config.Vars.Bucket)).Put([]byte("1"), data)
		})

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
		db := setupDB(t)
		defer cleanupDB(t, db)

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
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := NewNotificationsService(db, &MockExpo{})

		n := models.Notification{ID: "1", User: "user1"}
		data, _ := json.Marshal(n)

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			return tx.Bucket([]byte(config.Vars.Bucket)).Put([]byte("1"), data)
		})

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
	t.Run("Given multiple notifications, When filtering, Then return user notifications", func(t *testing.T) {
		// given
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := NewNotificationsService(db, &MockExpo{})

		n1 := models.Notification{ID: "1", User: "user1"}
		n2 := models.Notification{ID: "2", User: "user2"}

		b1, _ := json.Marshal(n1)
		b2, _ := json.Marshal(n2)

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			b := tx.Bucket([]byte(config.Vars.Bucket))

			if err := b.Put([]byte("1"), b1); err != nil {
				return err
			}

			if err := b.Put([]byte("2"), b2); err != nil {
				return err
			}

			return nil
		})

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
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := NewNotificationsService(db, &MockExpo{})

		n := models.Notification{ID: "1", User: "user1", Type: "added"}
		data, _ := json.Marshal(n)

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			return tx.Bucket([]byte(config.Vars.Bucket)).Put([]byte("1"), data)
		})

		// when
		err := service.DeleteNotification("user1", "added")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Given missing notification, When DeleteNotification, Then return error", func(t *testing.T) {
		// given
		db := setupDB(t)
		defer cleanupDB(t, db)

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
		db := setupDB(t)
		defer cleanupDB(t, db)

		mockExpo := &MockExpo{
			SendFunc: func(token, title, body string) error {
				return nil
			},
		}

		service := NewNotificationsService(db, mockExpo)

		n := models.Notification{
			ID:    "1",
			User:  "user1",
			Type:  "added",
			Token: "token123",
		}

		data, _ := json.Marshal(n)

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			return tx.Bucket([]byte(config.Vars.Bucket)).Put([]byte("1"), data)
		})

		// when
		err := service.SendPushNotification("added", "user1", "")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Given dev env, When SendPushNotification, Then use dev path", func(t *testing.T) {
		// given
		db := setupDB(t)
		defer cleanupDB(t, db)

		mockExpo := &MockExpo{
			SendFunc: func(token, title, body string) error {
				return nil
			},
		}

		service := NewNotificationsService(db, mockExpo)

		n := models.Notification{
			ID:    "1",
			User:  "user1",
			Type:  "added",
			Token: "token123",
		}

		data, _ := json.Marshal(n)

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			return tx.Bucket([]byte(config.Vars.Bucket)).Put([]byte("1"), data)
		})

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

func setupDB(t *testing.T) *bbolt.DB {
	db, err := bbolt.Open(tmpDB, 0600, nil)
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}

	bucket := "test-bucket"

	err = db.Update(func(tx *bbolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(bucket))
		return err
	})
	if err != nil {
		t.Fatalf("failed to create bucket: %v", err)
	}

	config.Vars.Bucket = bucket

	return db
}

func cleanupDB(t *testing.T, db *bbolt.DB) {
	err := db.Close()
	if err != nil {
		t.Fatalf("failed to close db: %v", err)
	}

	if err := os.Remove(tmpDB); err != nil && !os.IsNotExist(err) {
		t.Fatalf("failed to remove db file: %v", err)
	}
}

func mustUpdate(t *testing.T, db *bbolt.DB, fn func(tx *bbolt.Tx) error) {
	if err := db.Update(fn); err != nil {
		t.Fatalf("db update failed: %v", err)
	}
}
