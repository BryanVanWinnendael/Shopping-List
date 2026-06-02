package services

import (
	"errors"
	"shopping-list/cron/internal/config"
	"shopping-list/shared/contracts"
	"shopping-list/shared/models"
	"shopping-list/shared/tests"
	"testing"

	"go.etcd.io/bbolt"
)

type MockNotificationService struct {
	SendNotificationFunc func(user string, t string, text *string) error
}

type MockFirebase struct {
	SetFunc func(path string, data interface{}) error
	GetFunc func(path string, data interface{}) error
}

func TestCreateCronProduct(t *testing.T) {
	t.Run("Given valid cron product, When CreateCronProduct, Then return id", func(t *testing.T) {
		// given
		db := setup(t)

		service := &CronService{db: db}

		product := contracts.CreateCronProductRequest{
			Product:  "test",
			Category: "work",
			User:     "user1",
		}

		// when
		cronProduct, err := service.CreateCronProduct(&product)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if cronProduct.Id == "" {
			t.Fatalf("expected id to be generated")
		}
	})
}

func TestGetAllCronProducts(t *testing.T) {
	t.Run("Given products in db, When GetAllCronProducts, Then return products", func(t *testing.T) {
		// given
		db := setup(t)

		service := &CronService{db: db}

		product := models.CronProduct{Id: "1", Product: "a"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), product)

		// when
		cronProducts, err := service.GetAllCronProducts()

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if len(*cronProducts) != 1 {
			t.Fatalf("expected 1 product, got %d", len(*cronProducts))
		}
	})

	t.Run("Given invalid JSON in DB, When GetAllCronProducts, Then return error", func(t *testing.T) {
		// given
		db := setup(t)

		service := &CronService{db: db}

		invalidJSON := []byte("not-json")

		tests.Put(t, db, config.Vars.Bucket, []byte("1"), invalidJSON)

		// when
		_, err := service.GetAllCronProducts()

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}

func TestUpdateCronProductCategory(t *testing.T) {
	t.Run("Given existing product, When UpdateCronProductCategory, Then update success", func(t *testing.T) {
		// given
		db := setup(t)

		service := &CronService{db: db}

		product := models.CronProduct{Id: "1", Category: "old"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), product)

		request := &contracts.UpdateCronProductCategoryRequest{
			Category: "mock-category",
		}

		// when
		res, err := service.UpdateCronProductCategory("1", request)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res.Category != "mock-category" {
			t.Fatalf("expected category to be mock-category, got %s", res.Category)
		}
	})

	t.Run("Given missing product, When UpdateCronProductCategory, Then return error", func(t *testing.T) {
		// given
		db := setup(t)

		service := &CronService{db: db}

		request := &contracts.UpdateCronProductCategoryRequest{
			Category: "mock-category",
		}

		// when
		_, err := service.UpdateCronProductCategory("missing", request)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}

func TestDeleteCronProduct(t *testing.T) {
	t.Run("Given existing product, When DeleteCronProduct, Then success", func(t *testing.T) {
		// given
		db := setup(t)

		service := &CronService{db: db}

		product := models.CronProduct{Id: "1"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), product)

		// when
		res, err := service.DeleteCronProduct("1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if res.Id != "1" {
			t.Fatalf("expected id to be 1, got %s", res.Id)
		}

		if res.Message != "cron product deleted" {
			t.Fatalf("expected message to be \"cron product deleted\", got %s", res.Message)
		}
	})

	t.Run("Given missing product, When DeleteCronProduct, Then return error", func(t *testing.T) {
		// given
		db := setup(t)

		service := &CronService{db: db}

		// when
		_, err := service.DeleteCronProduct("missing")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}

func TestGetCronProductsByUser(t *testing.T) {
	t.Run("Given multiple products, When GetCronProductsByUser, Then return only user products", func(t *testing.T) {
		// given
		db := setup(t)

		service := &CronService{db: db}

		product1 := models.CronProduct{Id: "1", User: "user1"}
		product2 := models.CronProduct{Id: "2", User: "user2"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), product1)
		tests.Put(t, db, config.Vars.Bucket, []byte("2"), product2)

		// when
		products, err := service.GetCronProductsByUser("user1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if len(*products) != 1 {
			t.Fatalf("expected 1 product, got %d", len(*products))
		}
	})
}

func TestRunCronJob(t *testing.T) {
	t.Run("Given cron products, When RunCronJob, Then process and notify users", func(t *testing.T) {
		// given
		db := setup(t)

		mockNotif := &MockNotificationService{
			SendNotificationFunc: func(string, string, *string) error {
				return nil
			},
		}

		service := &CronService{
			db:       db,
			ns:       mockNotif,
			firebase: &MockFirebase{},
		}

		product := models.CronProduct{
			Id:       "1",
			Product:  "test",
			Category: "work",
			User:     "user1",
		}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), product)

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
			SendNotificationFunc: func(string, string, *string) error {
				return errors.New("fail")
			},
		}

		service := &CronService{
			db:       db,
			ns:       mockNotif,
			firebase: &MockFirebase{},
		}

		product := models.CronProduct{
			Id:       "1",
			Product:  "test",
			Category: "work",
			User:     "user1",
		}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), product)

		// when
		err := service.RunCronJob()

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})
}

func TestRunReminderCronJob(t *testing.T) {
	t.Run("Given cron products, When RunReminderCronJob, Then notify users", func(t *testing.T) {
		// given
		db := setup(t)

		mockNotif := &MockNotificationService{
			SendNotificationFunc: func(string, string, *string) error {
				return nil
			},
		}

		service := &CronService{
			db:       db,
			ns:       mockNotif,
			firebase: &MockFirebase{},
		}

		product := models.CronProduct{
			Id:       "1",
			Product:  "test",
			Category: "work",
			User:     "user1",
		}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), product)

		// when
		err := service.RunReminderCronJob()

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Given notification fails, When RunReminderCronJob, Then still completes", func(t *testing.T) {
		// given
		db := setup(t)

		mockNotif := &MockNotificationService{
			SendNotificationFunc: func(string, string, *string) error {
				return errors.New("fail")
			},
		}

		service := &CronService{
			db:       db,
			ns:       mockNotif,
			firebase: &MockFirebase{},
		}

		product := models.CronProduct{
			Id:       "1",
			Product:  "test",
			Category: "work",
			User:     "user1",
		}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), product)

		// when
		err := service.RunReminderCronJob()

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Given firebase get fails, When RunReminderCronJob, Then return error", func(t *testing.T) {
		db := setup(t)

		mockNotif := &MockNotificationService{
			SendNotificationFunc: func(string, string, *string) error {
				t.Fatal("should not send notification")
				return nil
			},
		}

		service := &CronService{
			db: db,
			ns: mockNotif,
			firebase: &MockFirebase{
				GetFunc: func(path string, data interface{}) error {
					return errors.New("firebase down")
				},
			},
		}

		err := service.RunReminderCronJob()

		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}

func TestNewCronService(t *testing.T) {
	t.Run("Given empty DB, When NewCronService, Then bucket is created", func(t *testing.T) {
		// given
		db := setup(t)

		mockNotif := &MockNotificationService{}
		mockFirebase := &MockFirebase{}

		// when
		service := NewCronService(mockFirebase, db, mockNotif)

		// then
		if service == nil {
			t.Fatalf("expected service to be created")
		}

		err := db.View(func(tx *bbolt.Tx) error {
			b := tx.Bucket([]byte(config.Vars.Bucket))
			if b == nil {
				t.Fatalf("expected bucket to be created")
			}
			return nil
		})

		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
	})

	t.Run("Given existing bucket, When NewCronService, Then no error and service created", func(t *testing.T) {
		// given
		db := setup(t)

		err := db.Update(func(tx *bbolt.Tx) error {
			_, err := tx.CreateBucketIfNotExists([]byte(config.Vars.Bucket))
			return err
		})
		if err != nil {
			t.Fatalf("failed to setup bucket: %v", err)
		}

		mockNotif := &MockNotificationService{}
		mockFirebase := &MockFirebase{}

		// when
		service := NewCronService(mockFirebase, db, mockNotif)

		// then
		if service == nil {
			t.Fatalf("expected service to be created")
		}
	})
}

func (m *MockNotificationService) SendNotification(user string, notificationType string, text *string) error {
	if m.SendNotificationFunc != nil {
		return m.SendNotificationFunc(user, notificationType, text)
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

func (m *MockFirebase) Get(path string, data interface{}) error {
	if m.GetFunc != nil {
		return m.GetFunc(path, data)
	}
	return nil
}
