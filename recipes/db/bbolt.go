package db

import (
	"log"
	"os"
	"path/filepath"

	"shopping-list/recipes/internal/config"
	"shopping-list/recipes/internal/constants"

	bolt "go.etcd.io/bbolt"
)

func InitBolt() *bolt.DB {
	if err := os.MkdirAll(config.Vars.DataDir, os.ModePerm); err != nil {
		log.Fatalf("Failed to create data directory: %v", err)
	}

	dbPath := filepath.Join(config.Vars.DataDir, "recipes.db")

	db, err := bolt.Open(dbPath, 0600, nil)
	if err != nil {
		log.Fatalf("Failed to open BoltDB: %v", err)
	}

	err = db.Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(constants.RecipesBucket))
		return err
	})
	if err != nil {
		log.Fatalf("Failed to create bucket: %v", err)
	}

	log.Println("Connected to BoltDB at", dbPath)
	return db
}
