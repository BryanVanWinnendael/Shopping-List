package db

import (
	"context"
	"log"
	"shopping-list/cron/internal/config"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/db"
	"google.golang.org/api/option"
)

func InitFirebase() *db.Client {
	ctx := context.Background()

	opt := option.WithCredentialsFile(config.Vars.GoogleApplicationCred)

	conf := &firebase.Config{
		DatabaseURL: config.Vars.FireBaseUrl,
	}

	app, err := firebase.NewApp(ctx, conf, opt)
	if err != nil {
		log.Fatalf("Failed to initialize Firebase app: %v", err)
	}

	client, err := app.Database(ctx)
	if err != nil {
		log.Fatalf("Failed to get Firebase database client: %v", err)
	}

	log.Println("Connected to Firebase successfully")
	return client
}
