package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Env struct {
	DataDir               string
	FireBaseUrl           string
	NotificationsAPIUrl   string
	CronAPIUrl            string
	RecipesAPIUrl         string
	CronTime              string
	APIAuthToken          string
	GoogleApplicationCred string
}

var Vars Env

func LoadEnv() {
	if os.Getenv("ENV") != "production" {
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found, continuing with environment variables")
		}
	}

	Vars = Env{
		DataDir:               getEnv("DATA_DIR", "./data"),
		FireBaseUrl:           getEnv("FIREBASE_URL", ""),
		NotificationsAPIUrl:   getEnv("NOTIFICATIONS_API", ""),
		CronAPIUrl:            getEnv("CRON_API", ""),
		RecipesAPIUrl:         getEnv("RECIPES_API", ""),
		GoogleApplicationCred: getEnv("GOOGLE_APPLICATION_CREDENTIALS", ""),
		CronTime:              getEnv("CRON_TIME", ""),
		APIAuthToken:          getEnv("API_TOKEN", ""),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
