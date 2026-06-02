package db

import (
	"log"
	"os"
	"path/filepath"

	"go.etcd.io/bbolt"
)

func InitBbolt(path string, dbName string, bucketName string) *bbolt.DB {
	if err := os.MkdirAll(path, os.ModePerm); err != nil {
		log.Fatalf("Failed to create data directory: %v", err)
	}

	dbPath := filepath.Join(path, dbName)

	db, err := bbolt.Open(dbPath, 0600, nil)
	if err != nil {
		log.Fatalf("Failed to open BboltDB: %v", err)
	}

	err = db.Update(func(tx *bbolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(bucketName))
		return err
	})
	if err != nil {
		log.Fatalf("Failed to create bucket: %v", err)
	}

	log.Println("Connected to BboltDB at", dbPath)
	return db
}
