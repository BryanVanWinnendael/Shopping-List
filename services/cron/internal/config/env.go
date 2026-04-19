package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Env struct {
	CronTime              string
	FireBaseUrl           string
	NotificationsAPIUrl   string
	DataDir               string
	GoogleApplicationCred string
	Bucket                string
	DB                    string
}

var Vars Env

func LoadEnv() {
	if os.Getenv("ENV") != "production" {
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found, continuing with environment variables")
		}
	}

	Vars = Env{
		CronTime:              getEnv("CRON_TIME", ""),
		FireBaseUrl:           getEnv("FIREBASE_URL", ""),
		NotificationsAPIUrl:   getEnv("NOTIFICATIONS_API_URL", ""),
		DataDir:               getEnv("DATA_DIR", "./data"),
		GoogleApplicationCred: getEnv("GOOGLE_APPLICATION_CREDENTIALS", ""),
		Bucket:                getEnv("BUCKET", "cron"),
		DB:                    getEnv("DB", "cron.db"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
