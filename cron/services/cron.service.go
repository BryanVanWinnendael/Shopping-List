package services

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"shopping-list/cron/internal/config"
	"shopping-list/cron/models"
	"time"

	"firebase.google.com/go/v4/db"
	"github.com/google/uuid"
	"go.etcd.io/bbolt"
)

type NotificationService interface {
	SendNotification(user string, notificationType string) error
}

type CronService struct {
	firebaseDB *db.Client
	db         *bbolt.DB
	ns         NotificationService
}

func NewCronService(firebaseDBClient *db.Client, bboltDB *bbolt.DB, notificationService NotificationService) *CronService {
	err := bboltDB.Update(func(tx *bbolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(config.Vars.Bucket))
		return err
	})
	if err != nil {
		log.Fatalf("Failed to create bucket: %v", err)
	}

	return &CronService{
		firebaseDB: firebaseDBClient,
		db:         bboltDB,
		ns:         notificationService,
	}
}

func (c *CronService) AddCronItem(item models.CronItem) (string, error) {
	if item.ID == "" {
		item.ID = uuid.New().String()
	}

	data, err := json.Marshal(item)
	if err != nil {
		return "", err
	}

	err = c.db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))
		return b.Put([]byte(item.ID), data)
	})
	if err != nil {
		return "", err
	}

	return item.ID, nil
}

func (c *CronService) GetAllCronItems() ([]models.CronItem, error) {
	var items []models.CronItem

	err := c.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))
		return b.ForEach(func(k, v []byte) error {
			var item models.CronItem
			if err := json.Unmarshal(v, &item); err != nil {
				return err
			}
			items = append(items, item)
			return nil
		})
	})

	return items, err
}

func (c *CronService) UpdateCategory(id string, newCategory string) error {
	return c.db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))
		v := b.Get([]byte(id))
		if v == nil {
			return errors.New("cron item not found")
		}

		var item models.CronItem
		if err := json.Unmarshal(v, &item); err != nil {
			return err
		}

		item.Category = newCategory
		data, err := json.Marshal(item)
		if err != nil {
			return err
		}

		return b.Put([]byte(id), data)
	})
}

func (c *CronService) Delete(id string) error {
	return c.db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))
		v := b.Get([]byte(id))
		if v == nil {
			return errors.New("cron item not found")
		}
		return b.Delete([]byte(id))
	})
}

func (c *CronService) AddItemToList(item models.Item) (string, error) {
	ctx := context.Background()
	ref := c.firebaseDB.NewRef(fmt.Sprintf("items/%s", item.ID))
	if err := ref.Set(ctx, item); err != nil {
		return "", err
	}
	return item.ID, nil
}

func (c *CronService) RunCronJob() error {
	items, err := c.GetAllCronItems()
	if err != nil {
		return fmt.Errorf("failed to get cron items: %w", err)
	}

	userSet := make(map[string]struct{})

	for _, cronItem := range items {
		id := uuid.New().String()
		now := time.Now().Unix()

		item := models.Item{
			Item:     cronItem.Item,
			Type:     "text",
			AddedBy:  cronItem.AddedBy,
			AddedAt:  now,
			ID:       id,
			Category: cronItem.Category,
		}

		if c.firebaseDB != nil {
			_, err := c.AddItemToList(item)
			if err != nil {
				fmt.Printf("failed to add item '%s' to Firebase: %v\n", item.Item, err)
			}
		}

		userSet[cronItem.AddedBy] = struct{}{}
	}

	for user := range userSet {
		err := c.ns.SendNotification(user, "timed")
		if err != nil {
			fmt.Printf("failed to send notification to user '%s': %v\n", user, err)
		}
	}

	return nil
}

func (c *CronService) GetCronItemsByAddedBy(addedBy string) ([]models.CronItem, error) {
	all, err := c.GetAllCronItems()
	if err != nil {
		return nil, err
	}

	var userItems []models.CronItem
	for _, item := range all {
		if item.AddedBy == addedBy {
			userItems = append(userItems, item)
		}
	}
	return userItems, nil
}
