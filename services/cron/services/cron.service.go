package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"shopping-list/cron/internal/config"
	firebaseModel "shopping-list/cron/models"
	"shopping-list/shared/contracts"
	"shopping-list/shared/models"
	"time"

	"firebase.google.com/go/v4/db"
	"github.com/google/uuid"
	"go.etcd.io/bbolt"
)

type NotificationService interface {
	SendNotification(user string, notificationType string, text *string) error
}

type FirebaseClient interface {
	Set(path string, data interface{}) error
	Get(path string, dest interface{}) error
}

type FirebaseClientImpl struct {
	client *db.Client
}

func NewFirebaseClient(client *db.Client) *FirebaseClientImpl {
	return &FirebaseClientImpl{client: client}
}

type CronService struct {
	firebase FirebaseClient
	db       *bbolt.DB
	ns       NotificationService
}

func NewCronService(firebaseDBClient FirebaseClient, bboltDB *bbolt.DB, notificationService NotificationService) *CronService {
	err := bboltDB.Update(func(tx *bbolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(config.Vars.Bucket))
		return err
	})
	if err != nil {
		log.Fatalf("failed to create bucket: %v", err)
	}

	return &CronService{
		firebase: firebaseDBClient,
		db:       bboltDB,
		ns:       notificationService,
	}
}

func (f *FirebaseClientImpl) Set(path string, data interface{}) error {
	ctx := context.Background()
	ref := f.client.NewRef(path)
	return ref.Set(ctx, data)
}

func (f *FirebaseClientImpl) Get(path string, dest interface{}) error {
	ctx := context.Background()
	ref := f.client.NewRef(path)
	return ref.Get(ctx, dest)
}

func (c *CronService) CreateCronProduct(cronProductRequest *contracts.CreateCronProductRequest) (*contracts.CreateCronProductResponse, error) {
	cronProduct := models.CronProduct{
		Id:       uuid.New().String(),
		Category: cronProductRequest.Category,
		Product:  cronProductRequest.Product,
		User:     cronProductRequest.User,
	}

	data, err := json.Marshal(cronProduct)
	if err != nil {
		return nil, err
	}

	err = c.db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))
		return b.Put([]byte(cronProduct.Id), data)
	})
	if err != nil {
		return nil, err
	}

	return &contracts.CreateCronProductResponse{
		Id:       cronProduct.Id,
		Product:  cronProduct.Product,
		User:     cronProduct.User,
		Category: cronProduct.Category,
	}, nil
}

func (c *CronService) GetAllCronProducts() (*contracts.GetAllCronProductsResponse, error) {
	var cronProducts []models.CronProduct

	err := c.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))
		return b.ForEach(func(k, v []byte) error {
			var product models.CronProduct
			if err := json.Unmarshal(v, &product); err != nil {
				return err
			}
			cronProducts = append(cronProducts, product)
			return nil
		})
	})
	if err != nil {
		return nil, err
	}

	result := contracts.GetAllCronProductsResponse(cronProducts)
	return &result, nil
}

func (c *CronService) UpdateCronProductCategory(id string, request *contracts.UpdateCronProductCategoryRequest) (*contracts.UpdateCronProductCategoryResponse, error) {
	var cronProduct models.CronProduct

	err := c.db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))
		v := b.Get([]byte(id))
		if v == nil {
			return errors.New("cron product not found")
		}

		if err := json.Unmarshal(v, &cronProduct); err != nil {
			return err
		}

		cronProduct.Category = request.Category
		data, err := json.Marshal(cronProduct)
		if err != nil {
			return err
		}

		return b.Put([]byte(id), data)
	})
	if err != nil {
		return nil, err
	}

	return &contracts.UpdateCronProductCategoryResponse{
		Category: request.Category,
		Id:       id,
		Product:  cronProduct.Product,
		User:     cronProduct.User,
	}, nil
}

func (c *CronService) DeleteCronProduct(id string) (*contracts.DeleteCronProductResponse, error) {
	err := c.db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))
		v := b.Get([]byte(id))
		if v == nil {
			return errors.New("cron product not found")
		}
		return b.Delete([]byte(id))
	})
	if err != nil {
		return nil, err
	}

	return &contracts.DeleteCronProductResponse{
		Id:      id,
		Message: "cron product deleted",
	}, nil
}

func (c *CronService) GetCronProductsByUser(user string) (*contracts.GetCronProductsByUserResponse, error) {
	cronProducts, err := c.GetAllCronProducts()
	if err != nil {
		return nil, err
	}

	var userProducts []models.CronProduct
	for _, cronProduct := range *cronProducts {
		if cronProduct.User == user {
			userProducts = append(userProducts, cronProduct)
		}
	}

	res := contracts.GetCronProductsByUserResponse(userProducts)
	return &res, nil
}

func (c *CronService) RunCronJob() error {
	cronProducts, err := c.GetAllCronProducts()
	if err != nil {
		return fmt.Errorf("failed to get cron products: %w", err)
	}

	userSet := make(map[string]struct{})

	for _, cronProduct := range *cronProducts {
		id := uuid.New().String()
		now := time.Now().Unix()

		product := firebaseModel.CronProduct{
			Name:     cronProduct.Product,
			Type:     "text",
			User:     cronProduct.User,
			Date:     now,
			Id:       id,
			Category: cronProduct.Category,
		}

		err := c.addCronProductToList(product)
		if err != nil {
			fmt.Printf("failed to add product '%s' to Firebase: %v\n", product.Name, err)
		}

		userSet[cronProduct.User] = struct{}{}
	}

	for user := range userSet {
		err := c.ns.SendNotification(user, "timed", nil)
		if err != nil {
			fmt.Printf("failed to send notification to user '%s': %v\n", user, err)
		}
	}

	return nil
}

func (c *CronService) RunReminderCronJob() error {
	count, err := c.getCountProductsInFirebase()
	fmt.Printf("count of products in Firebase: %d\n", count)
	if err != nil {
		return fmt.Errorf("failed to get cron products: %w", err)
	}

	if count > 0 {
		text := fmt.Sprintf("You have %d products in your shopping list. Don't forget to check them out!", count)
		err := c.ns.SendNotification("All", "timed", &text)
		if err != nil {
			fmt.Printf("failed to send reminder notification: %v\n", err)
		}
	}

	return nil
}

func (c *CronService) addCronProductToList(cronProduct firebaseModel.CronProduct) error {
	path := fmt.Sprintf("products/%s", cronProduct.Id)
	if err := c.firebase.Set(path, cronProduct); err != nil {
		return err
	}

	return nil
}

func (c *CronService) getCountProductsInFirebase() (int, error) {
	var products map[string]firebaseModel.CronProduct
	if err := c.firebase.Get("products", &products); err != nil {
		return 0, err
	}

	weekAgo := time.Now().AddDate(0, 0, -7).Unix()

	count := 0
	for _, product := range products {
		if product.Date < weekAgo {
			count++
		}
	}

	return count, nil
}
