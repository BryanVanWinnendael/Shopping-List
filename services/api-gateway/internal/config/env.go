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
		CategoryModelAPIURL:  getEnv("CATEGORY_MODEL_API_URL", "http://shopping-list-category-model:3000/api"),
		LogsAPIURL:           getEnv("LOGS_API_URL", "http://shopping-list-logs:3000/api/logs"),
		NotificationsAPIURL:  getEnv("NOTIFICATIONS_API_URL", "http://shopping-list-notifications:3000/api/notifications"),
		ProductsSearchAPIURL: getEnv("PRODUCTS_SEARCH_API_URL", "http://shopping-list-products-search:3000/api/products"),
		StorageAPIURL:        getEnv("STORAGE_API_URL", "http://shopping-list-storage:3000/api/storage"),
		RecipesAPIURL:        getEnv("RECIPES_API_URL", "http://shopping-list-recipes:3000/api/recipes"),
		CronAPIURL:           getEnv("CRON_API_URL", "http://shopping-list-cron:3000/api/cron"),
		APIAuthToken:         getEnv("API_TOKEN", ""),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
