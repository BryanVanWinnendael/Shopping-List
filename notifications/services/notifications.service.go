package services

import (
	"encoding/json"
	"errors"
	"log"
	"shopping-list/notifications/internal/constants"
	"shopping-list/notifications/models"

	"github.com/google/uuid"
	bolt "go.etcd.io/bbolt"
)

type ExpoPushService interface {
	SendPushToUser(token string, title string, body string) error
}

type NotificationsService struct {
	db   *bolt.DB
	expo ExpoPushService
}

func NewNotificationsService(db *bolt.DB, expo ExpoPushService) *NotificationsService {
	err := db.Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(constants.NotificationsBucket))
		return err
	})
	if err != nil {
		log.Fatalf("failed to create bucket: %v", err)
	}

	return &NotificationsService{
		db:   db,
		expo: expo,
	}
}

func (ns *NotificationsService) CreateNotification(data *models.NotificationCreate) (*models.Notification, error) {
	notif := &models.Notification{
		ID:    uuid.New().String(),
		User:  data.User,
		Type:  data.Type,
		Token: data.Token,
	}
	notifJSON, _ := json.MarshalIndent(notif, "", "  ")

	err := ns.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(constants.NotificationsBucket))
		return b.Put([]byte(notif.ID), notifJSON)
	})
	if err != nil {
		return nil, err
	}

	return notif, nil
}

func (ns *NotificationsService) GetNotification(id string) (*models.Notification, error) {
	var notif models.Notification

	err := ns.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(constants.NotificationsBucket))
		v := b.Get([]byte(id))
		if v == nil {
			return errors.New("notification not found")
		}
		return json.Unmarshal(v, &notif)
	})

	if err != nil {
		return nil, err
	}

	return &notif, nil
}

func (ns *NotificationsService) GetAllNotifications() ([]models.Notification, error) {
	var list []models.Notification

	err := ns.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(constants.NotificationsBucket))
		return b.ForEach(func(k, v []byte) error {
			var n models.Notification
			if err := json.Unmarshal(v, &n); err != nil {
				return err
			}
			list = append(list, n)
			return nil
		})
	})

	return list, err
}

func (ns *NotificationsService) GetUserNotifications(userID string) ([]models.Notification, error) {
	all, err := ns.GetAllNotifications()
	if err != nil {
		return nil, err
	}

	var userNotifs []models.Notification
	for _, n := range all {
		if n.User == userID {
			userNotifs = append(userNotifs, n)
		}
	}

	return userNotifs, nil
}

func (ns *NotificationsService) DeleteNotification(user string, notifType string) error {
	return ns.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(constants.NotificationsBucket))
		var found bool
		c := b.Cursor()
		for k, v := c.First(); k != nil; k, v = c.Next() {
			var n models.Notification
			if err := json.Unmarshal(v, &n); err != nil {
				return err
			}
			if n.User == user && n.Type == notifType {
				if err := b.Delete(k); err != nil {
					return err
				}
				found = true
			}
		}
		if !found {
			return errors.New("record not found")
		}
		return nil
	})
}

func (ns *NotificationsService) SendPushNotification(notifType string, user string, env string) error {
	if env == "dev" {
		return sendDevNotification(ns.expo, ns.db, notifType, user)
	}

	all, err := ns.GetAllNotifications()
	if err != nil {
		return err
	}

	notificationBody := GetNotificationBody(notifType, user)
	for _, n := range all {
		if n.Type == notifType && (notifType != "timed" || n.User == user) {
			if err := ns.expo.SendPushToUser(
				n.Token,
				"Shopping List",
				notificationBody,
			); err != nil {
				log.Printf("Failed to send to user %s: %v\n", n.User, err)
			}
		}
	}

	return nil
}

func sendDevNotification(expo ExpoPushService, db *bolt.DB, notifType string, user string) error {
	all := []models.Notification{}

	err := db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(constants.NotificationsBucket))
		return b.ForEach(func(k, v []byte) error {
			var n models.Notification
			if err := json.Unmarshal(v, &n); err != nil {
				return err
			}
			if n.Type == notifType && n.User == user {
				all = append(all, n)
			}
			return nil
		})
	})
	if err != nil {
		return err
	}

	notificationBody := GetNotificationBody(notifType, user)
	for _, n := range all {
		if err := expo.SendPushToUser(
			n.Token,
			"[DEV] Shopping List",
			notificationBody,
		); err != nil {
			log.Printf("Failed to send to user %s: %v\n", n.User, err)
		}
	}

	return nil
}

func GetNotificationBody(notifType string, user string) string {
	switch notifType {
	case "added":
		return user + " added something to the list"
	case "removed":
		return user + " removed something from the list"
	case "timed":
		return "Your weekly items have been added to the shopping list"
	default:
		return user + " has a notification"
	}
}
