package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Env struct {
	CronTime              string
	CronTimeReminder      string
	FireBaseUrl           string
	NotificationsAPIUrl   string
	DataDir               string
	GoogleApplicationCred string
	Bucket                string
	DB                    string
	Port                  string
	LogsAPIURL            string
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
		CronTimeReminder:      getEnv("CRON_TIME_REMINDER", ""),
		FireBaseUrl:           getEnv("FIREBASE_URL", ""),
		NotificationsAPIUrl:   getEnv("NOTIFICATIONS_API_URL", "http://shopping-list-notifications:3000/api/notifications"),
		DataDir:               getEnv("DATA_DIR", "./data"),
		GoogleApplicationCred: getEnv("GOOGLE_APPLICATION_CREDENTIALS", ""),
		Bucket:                getEnv("BUCKET", "cron"),
		DB:                    getEnv("DB", "cron.db"),
		Port:                  getEnv("PORT", "3000"),
		LogsAPIURL:            getEnv("LOGS_API_URL", "http://shopping-list-logs:3000/api/logs"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
