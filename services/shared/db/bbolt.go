package db

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/labstack/echo/v4"
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

func BackupHandler(db *bbolt.DB, name string) echo.HandlerFunc {
	return func(c echo.Context) error {
		fmt.Println("Backup initiated")
		c.Response().Header().Set(
			echo.HeaderContentType,
			"application/octet-stream",
		)

		c.Response().Header().Set(
			echo.HeaderContentDisposition,
			fmt.Sprintf(`attachment; filename="%s.db"`, name),
		)

		err := db.View(func(tx *bbolt.Tx) error {
			_, err := tx.WriteTo(c.Response())
			return err
		})

		if err != nil {
			return echo.NewHTTPError(
				http.StatusInternalServerError,
				err.Error(),
			)
		}

		return nil
	}
}
