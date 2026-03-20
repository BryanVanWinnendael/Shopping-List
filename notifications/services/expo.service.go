package services

import (
	"bytes"
	"encoding/json"
	"net/http"
)

type ExpoPushServiceImpl struct{}

func NewExpoPushService() *ExpoPushServiceImpl {
	return &ExpoPushServiceImpl{}
}

func (e *ExpoPushServiceImpl) SendPushToUser(token, title, body string) error {
	payload := map[string]interface{}{
		"to":    token,
		"title": title,
		"body":  body,
	}

	data, _ := json.Marshal(payload)

	_, err := http.Post("https://exp.host/--/api/v2/push/send", "application/json", bytes.NewBuffer(data))
	return err
}
