package db

import (
	"encoding/json"
	"fmt"
	"os"
	"testing"

	"go.etcd.io/bbolt"
)

func SetupDB(t *testing.T, tmpDB string, bucket string) *bbolt.DB {
	t.Helper()

	db, err := bbolt.Open(tmpDB, 0600, nil)
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}

	err = db.Update(func(tx *bbolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(bucket))
		return err
	})
	if err != nil {
		t.Fatalf("failed to create bucket: %v", err)
	}

	t.Cleanup(func() { cleanupDB(t, db, tmpDB) })

	return db
}

func cleanupDB(t *testing.T, db *bbolt.DB, tmpDB string) {
	t.Helper()

	err := db.Close()
	if err != nil {
		t.Fatalf("failed to close db: %v", err)
	}

	if err := os.Remove(tmpDB); err != nil && !os.IsNotExist(err) {
		t.Fatalf("failed to remove db file: %v", err)
	}
}

func updateDB(t *testing.T, db *bbolt.DB, fn func(tx *bbolt.Tx) error) {
	err := db.Update(fn)
	if err != nil {
		t.Fatalf("db update failed: %v", err)
	}
}

func Put(t *testing.T, db *bbolt.DB, bucket string, key []byte, v any) {
	data, err := json.Marshal(v)
	if err != nil {
		t.Fatalf("failed to marshal value: %v", err)
	}

	updateDB(t, db, func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(bucket))
		if b == nil {
			return fmt.Errorf("bucket %s not found", bucket)
		}
		return b.Put(key, data)
	})
}
