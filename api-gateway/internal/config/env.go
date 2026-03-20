package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Env struct {
	CategoryModelAPIURL  string
	LogsAPIURL           string
	NotificationsAPIURL  string
	ProductsSearchAPIURL string
	StorageAPIURL        string
	RecipesAPIURL        string
	CronAPIURL           string
	APIAuthToken         string
}

var Vars Env

func LoadEnv() {
	if os.Getenv("ENV") != "production" {
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found, continuing with environment variables")
		}
	}

	Vars = Env{
		CategoryModelAPIURL:  getEnv("CATEGORY_MODEL_API_URL", ""),
		LogsAPIURL:           getEnv("LOGS_API_URL", ""),
		NotificationsAPIURL:  getEnv("NOTIFICATIONS_API_URL", ""),
		ProductsSearchAPIURL: getEnv("PRODUCTS_SEARCH_API_URL", ""),
		StorageAPIURL:        getEnv("STORAGE_API_URL", ""),
		RecipesAPIURL:        getEnv("RECIPES_API_URL", ""),
		CronAPIURL:           getEnv("CRON_API_URL", ""),
		APIAuthToken:         getEnv("API_TOKEN", ""),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
