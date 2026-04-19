package db

import (
	"log"
	"os"
	"path/filepath"

	"shopping-list/recipes/internal/config"

	"go.etcd.io/bbolt"
)

func InitBbolt() *bbolt.DB {
	if err := os.MkdirAll(config.Vars.DataDir, os.ModePerm); err != nil {
		log.Fatalf("Failed to create data directory: %v", err)
	}

	dbPath := filepath.Join(config.Vars.DataDir, config.Vars.DB)

	db, err := bbolt.Open(dbPath, 0600, nil)
	if err != nil {
		log.Fatalf("Failed to open BoltDB: %v", err)
	}

	err = db.Update(func(tx *bbolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(config.Vars.Bucket))
		return err
	})
	if err != nil {
		log.Fatalf("Failed to create bucket: %v", err)
	}

	log.Println("Connected to BoltDB at", dbPath)
	return db
}
