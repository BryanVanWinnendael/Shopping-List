package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Env struct {
	APIAuthToken string
	Host         string
	StorageDir   string
}

var Vars Env

func LoadEnv() {
	if os.Getenv("ENV") != "production" {
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found, continuing with environment variables")
		}
	}

	Vars = Env{
		APIAuthToken: getEnv("API_TOKEN", ""),
		Host:         getEnv("HOST", ""),
		StorageDir:   getEnv("STORAGE_DIR", "./storage"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
