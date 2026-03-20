package db

import (
	"log"
	"os"
	"path/filepath"
	"shopping-list/cron/internal/config"
	"shopping-list/cron/internal/constants"

	bolt "go.etcd.io/bbolt"
)

func InitBolt() *bolt.DB {
	if err := os.MkdirAll(config.Vars.DataDir, os.ModePerm); err != nil {
		log.Fatalf("Failed to create data directory: %v", err)
	}

	dbPath := filepath.Join(config.Vars.DataDir, "cron.db")

	db, err := bolt.Open(dbPath, 0600, nil)
	if err != nil {
		log.Fatalf("Failed to open BoltDB: %v", err)
	}

	err = db.Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(constants.CronBucket))
		return err
	})
	if err != nil {
		log.Fatalf("Failed to create bucket: %v", err)
	}

	log.Println("Connected to BoltDB at", dbPath)
	return db
}
