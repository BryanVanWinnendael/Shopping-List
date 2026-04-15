package services

import (
	"encoding/json"
	"errors"
	"os"
	"shopping-list/cron/internal/config"
	"shopping-list/cron/models"
	"testing"

	"go.etcd.io/bbolt"
)

type MockNotificationService struct {
	SendFunc func(user string, t string) error
}

type MockFirebase struct {
	SetFunc func(path string, data interface{}) error
}

const tmpDB = "test.db"

func TestAddCronItem(t *testing.T) {
	t.Run("Given valid cron item, When AddCronItem, Then return id", func(t *testing.T) {
		// given
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := &CronService{db: db}

		item := models.CronItem{
			Item:     "test",
			Category: "work",
			AddedBy:  "user1",
		}

		// when
		id, err := service.AddCronItem(item)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if id == "" {
			t.Fatalf("expected id to be generated")
		}
	})
}

func TestGetAllCronItems(t *testing.T) {
	t.Run("Given items in db, When GetAllCronItems, Then return items", func(t *testing.T) {
		// given
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := &CronService{db: db}

		item := models.CronItem{ID: "1", Item: "a"}
		data, err := json.Marshal(item)
		if err != nil {
			t.Fatalf("failed to marshal item: %v", err)
		}

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			return tx.Bucket([]byte(config.Vars.Bucket)).Put([]byte("1"), data)
		})

		// when
		items, err := service.GetAllCronItems()

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if len(items) != 1 {
			t.Fatalf("expected 1 item, got %d", len(items))
		}
	})
}

func TestUpdateCategory(t *testing.T) {
	t.Run("Given existing item, When UpdateCategory, Then update success", func(t *testing.T) {
		// given
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := &CronService{db: db}

		item := models.CronItem{ID: "1", Category: "old"}
		data, err := json.Marshal(item)
		if err != nil {
			t.Fatalf("failed to marshal item: %v", err)
		}

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			return tx.Bucket([]byte(config.Vars.Bucket)).Put([]byte("1"), data)
		})

		// when
		err = service.UpdateCategory("1", "new")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Given missing item, When UpdateCategory, Then return error", func(t *testing.T) {
		// given
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := &CronService{db: db}

		// when
		err := service.UpdateCategory("missing", "new")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}

func TestDelete(t *testing.T) {
	t.Run("Given existing item, When Delete, Then success", func(t *testing.T) {
		// given
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := &CronService{db: db}

		item := models.CronItem{ID: "1"}
		data, err := json.Marshal(item)
		if err != nil {
			t.Fatalf("failed to marshal item: %v", err)
		}

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			return tx.Bucket([]byte(config.Vars.Bucket)).Put([]byte("1"), data)
		})

		// when
		err = service.Delete("1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Given missing item, When Delete, Then return error", func(t *testing.T) {
		// given
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := &CronService{db: db}

		// when
		err := service.Delete("missing")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}

func TestGetCronItemsByAddedBy(t *testing.T) {
	t.Run("Given multiple items, When filtering by user, Then return only user items", func(t *testing.T) {
		// given
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := &CronService{db: db}

		item1 := models.CronItem{ID: "1", AddedBy: "user1"}
		item2 := models.CronItem{ID: "2", AddedBy: "user2"}

		b1, _ := json.Marshal(item1)
		b2, _ := json.Marshal(item2)

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
		items, err := service.GetCronItemsByAddedBy("user1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if len(items) != 1 {
			t.Fatalf("expected 1 item, got %d", len(items))
		}
	})
}

func TestRunCronJob(t *testing.T) {
	t.Run("Given cron items, When RunCronJob, Then process and notify users", func(t *testing.T) {
		// given
		db := setupDB(t)
		defer cleanupDB(t, db)

		mockNotif := &MockNotificationService{
			SendFunc: func(user string, t string) error {
				return nil
			},
		}

		service := &CronService{
			db:       db,
			ns:       mockNotif,
			firebase: &MockFirebase{},
		}

		item := models.CronItem{
			ID:       "1",
			Item:     "test",
			Category: "work",
			AddedBy:  "user1",
		}

		data, err := json.Marshal(item)
		if err != nil {
			t.Fatalf("failed to marshal item: %v", err)
		}

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			return tx.Bucket([]byte(config.Vars.Bucket)).Put([]byte("1"), data)
		})

		// when
		err = service.RunCronJob()

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})
}

func TestGetAllCronItems_UnmarshalError(t *testing.T) {
	t.Run("Given invalid JSON in DB, Then return error", func(t *testing.T) {
		// given
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := &CronService{db: db}

		invalidJSON := []byte("not-json")

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			return tx.Bucket([]byte(config.Vars.Bucket)).Put([]byte("1"), invalidJSON)
		})

		// when
		_, err := service.GetAllCronItems()

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}

func TestRunCronJob_NotificationError(t *testing.T) {
	t.Run("Given notification fails, Then still completes", func(t *testing.T) {
		// given
		db := setupDB(t)
		defer cleanupDB(t, db)

		mockNotif := &MockNotificationService{
			SendFunc: func(user, t string) error {
				return errors.New("fail")
			},
		}

		service := &CronService{
			db:       db,
			ns:       mockNotif,
			firebase: &MockFirebase{},
		}

		item := models.CronItem{
			ID:       "1",
			Item:     "test",
			Category: "work",
			AddedBy:  "user1",
		}

		data, _ := json.Marshal(item)

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			return tx.Bucket([]byte(config.Vars.Bucket)).Put([]byte("1"), data)
		})

		// when
		err := service.RunCronJob()

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})
}

func (m *MockNotificationService) SendNotification(user string, notificationType string) error {
	if m.SendFunc != nil {
		return m.SendFunc(user, notificationType)
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
	err := db.Update(fn)
	if err != nil {
		t.Fatalf("db update failed: %v", err)
	}
}

func (m *MockFirebase) Set(path string, data interface{}) error {
	if m.SetFunc != nil {
		return m.SetFunc(path, data)
	}
	return nil
}
