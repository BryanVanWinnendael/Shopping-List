package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Env struct {
	DataDir string
	Bucket  string
	DB      string
}

var Vars Env

func LoadEnv() {
	if os.Getenv("ENV") != "production" {
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found, continuing with environment variables")
		}
	}

	Vars = Env{
		DataDir: getEnv("DATA_DIR", "./data"),
		Bucket:  getEnv("BUCKET", "recipes"),
		DB:      getEnv("DB", "recipes.db"),
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
