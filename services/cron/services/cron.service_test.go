package services

import (
	"errors"
	"shopping-list/cron/internal/config"
	"shopping-list/cron/models"
	"shopping-list/shared/tests"
	"testing"

	"go.etcd.io/bbolt"
)

type MockNotificationService struct {
	SendNotificationFunc func(user string, t string) error
}

type MockFirebase struct {
	SetFunc func(path string, data interface{}) error
}

func TestCreateCronItem(t *testing.T) {
	t.Run("Given valid cron item, When CreateCronItem, Then return id", func(t *testing.T) {
		// given
		db := setup(t)

		service := &CronService{db: db}

		item := models.CronItem{
			Item:     "test",
			Category: "work",
			AddedBy:  "user1",
		}

		// when
		id, err := service.CreateCronItem(item)

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
		db := setup(t)

		service := &CronService{db: db}

		item := models.CronItem{ID: "1", Item: "a"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), item)

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

	t.Run("Given invalid JSON in DB, When GetAllCronItems, Then return error", func(t *testing.T) {
		// given
		db := setup(t)

		service := &CronService{db: db}

		invalidJSON := []byte("not-json")

		tests.Put(t, db, config.Vars.Bucket, []byte("1"), invalidJSON)

		// when
		_, err := service.GetAllCronItems()

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}

func TestUpdateCronItemCategory(t *testing.T) {
	t.Run("Given existing item, When UpdateCronItemCategory, Then update success", func(t *testing.T) {
		// given
		db := setup(t)

		service := &CronService{db: db}

		item := models.CronItem{ID: "1", Category: "old"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), item)

		// when
		err := service.UpdateCronItemCategory("1", "new")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Given missing item, When UpdateCronItemCategory, Then return error", func(t *testing.T) {
		// given
		db := setup(t)

		service := &CronService{db: db}

		// when
		err := service.UpdateCronItemCategory("missing", "new")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}

func TestDeleteCronItem(t *testing.T) {
	t.Run("Given existing item, When DeleteCronItem, Then success", func(t *testing.T) {
		// given
		db := setup(t)

		service := &CronService{db: db}

		item := models.CronItem{ID: "1"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), item)

		// when
		err := service.DeleteCronItem("1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Given missing item, When DeleteCronItem, Then return error", func(t *testing.T) {
		// given
		db := setup(t)

		service := &CronService{db: db}

		// when
		err := service.DeleteCronItem("missing")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}

func TestGetCronItemsByUser(t *testing.T) {
	t.Run("Given multiple items, When GetCronItemsByUser, Then return only user items", func(t *testing.T) {
		// given
		db := setup(t)

		service := &CronService{db: db}

		item1 := models.CronItem{ID: "1", AddedBy: "user1"}
		item2 := models.CronItem{ID: "2", AddedBy: "user2"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), item1)
		tests.Put(t, db, config.Vars.Bucket, []byte("2"), item2)

		// when
		items, err := service.GetCronItemsByUser("user1")

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
		db := setup(t)

		mockNotif := &MockNotificationService{
			SendNotificationFunc: func(user string, t string) error {
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
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), item)

		// when
		err := service.RunCronJob()

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Given notification fails, When RunCronJob, Then still completes", func(t *testing.T) {
		// given
		db := setup(t)

		mockNotif := &MockNotificationService{
			SendNotificationFunc: func(user, t string) error {
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
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), item)

		// when
		err := service.RunCronJob()

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})
}

func (m *MockNotificationService) SendNotification(user string, notificationType string) error {
	if m.SendNotificationFunc != nil {
		return m.SendNotificationFunc(user, notificationType)
	}
	return nil
}

func setup(t *testing.T) *bbolt.DB {
	bucket := "test-bucket"
	tmpDB := "test.db"

	db := tests.SetupDB(t, tmpDB, bucket)
	config.Vars.Bucket = bucket

	return db
}

func (m *MockFirebase) Set(path string, data interface{}) error {
	if m.SetFunc != nil {
		return m.SetFunc(path, data)
	}
	return nil
}
