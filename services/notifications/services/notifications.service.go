package services

import (
	"encoding/json"
	"errors"
	"log"
	"shopping-list/notifications/internal/config"
	"shopping-list/shared/contracts"
	"shopping-list/shared/models"

	"github.com/google/uuid"
	"go.etcd.io/bbolt"
)

type ExpoPushService interface {
	PushNotificationToUser(token string, title string, body string) error
}

type NotificationsService struct {
	db   *bbolt.DB
	expo ExpoPushService
}

func NewNotificationsService(db *bbolt.DB, expo ExpoPushService) *NotificationsService {
	err := db.Update(func(tx *bbolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(config.Vars.Bucket))
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

func (ns *NotificationsService) Subscribe(request *contracts.CreateNotificationRequest) (*contracts.CreateNotificationResponse, error) {
	notif := &models.Notification{
		Id:    uuid.New().String(),
		User:  request.User,
		Type:  request.Type,
		Token: request.Token,
	}
	notifJSON, _ := json.MarshalIndent(notif, "", "  ")

	err := ns.db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))
		return b.Put([]byte(notif.Id), notifJSON)
	})
	if err != nil {
		return nil, err
	}

	return &contracts.CreateNotificationResponse{
		Id:    notif.Id,
		User:  notif.User,
		Type:  notif.Type,
		Token: notif.Token,
	}, nil
}

func (ns *NotificationsService) GetAllNotifications() (*contracts.GetAllNotificationsResponse, error) {
	var result contracts.GetAllNotificationsResponse

	err := ns.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))
		return b.ForEach(func(k, v []byte) error {
			var n models.Notification
			if err := json.Unmarshal(v, &n); err != nil {
				return err
			}
			result = append(result, n)
			return nil
		})
	})

	return &result, err
}

func (ns *NotificationsService) GetUserNotifications(user string) (*contracts.GetUserNotificationsResponse, error) {
	notifications, err := ns.GetAllNotifications()
	if err != nil {
		return nil, err
	}

	var result contracts.GetUserNotificationsResponse
	for _, n := range *notifications {
		if n.User == user {
			result = append(result, n)
		}
	}

	return &result, nil
}

func (ns *NotificationsService) Unsubscribe(user string, notifType models.NotificationType) (*contracts.DeleteUserNotificationResponse, error) {
	err := ns.db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))
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
	if err != nil {
		return nil, err
	}
	return &contracts.DeleteUserNotificationResponse{
		User:    user,
		Type:    notifType,
		Message: "notification unsubscribed",
	}, nil
}

func (ns *NotificationsService) PushUserNotificationByType(notifType models.NotificationType, user string, request *contracts.PushUserNotificationByTypeRequest) (*contracts.PushUserNotificationByTypeResponse, error) {
	if request.Env == "dev" {
		// for dev, only to specific user to avoid spamming everyone during development
		return pushDevNotification(ns.expo, ns.db, notifType, user)
	}

	subscriptions, err := ns.GetAllNotifications()
	if err != nil {
		return nil, err
	}

	if user == "All" && request.Text != "" {
		// if user is "All", send to all users with the specified notification type and custom text
		return sendNotificationToAllUsers(ns.expo, notifType, subscriptions, request.Text)
	}

	notificationBody := GetNotificationBody(notifType, user)
	for _, n := range *subscriptions {
		if n.Type == notifType && (notifType != "timed" || n.User == user) {
			if err := ns.expo.PushNotificationToUser(
				n.Token,
				"Shopping List",
				notificationBody,
			); err != nil {
				log.Printf("failed to push to user %s: %v\n", n.User, err)
			}
		}
	}

	return &contracts.PushUserNotificationByTypeResponse{
		User:    user,
		Type:    notifType,
		Message: "notification pushed to user",
	}, nil
}

func sendNotificationToAllUsers(expo ExpoPushService, notifType models.NotificationType, subscriptions *contracts.GetAllNotificationsResponse, text string) (*contracts.PushUserNotificationByTypeResponse, error) {
	for _, n := range *subscriptions {
		if n.Type == notifType {
			if err := expo.PushNotificationToUser(
				n.Token,
				"Shopping List",
				text,
			); err != nil {
				log.Printf("failed to push to user %s: %v\n", n.User, err)
			}
		}
	}

	return &contracts.PushUserNotificationByTypeResponse{
		Type:    notifType,
		Message: "notification pushed to all users",
	}, nil
}

func pushDevNotification(expo ExpoPushService, db *bbolt.DB, notifType models.NotificationType, user string) (*contracts.PushUserNotificationByTypeResponse, error) {
	var all []models.Notification

	err := db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))
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
		return nil, err
	}

	notificationBody := GetNotificationBody(notifType, user)
	for _, n := range all {
		if err := expo.PushNotificationToUser(
			n.Token,
			"[DEV] Shopping List",
			notificationBody,
		); err != nil {
			log.Printf("failed to push to user %s: %v\n", n.User, err)
		}
	}

	return &contracts.PushUserNotificationByTypeResponse{
		User:    user,
		Type:    notifType,
		Message: "[DEV] notification pushed to user",
	}, nil
}

func GetNotificationBody(notifType models.NotificationType, user string) string {
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
