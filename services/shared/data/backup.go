package data

import (
	"archive/zip"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/labstack/echo/v4"
)

func BackupFolderHandler(folderPath string, name string) echo.HandlerFunc {
	return func(c echo.Context) error {
		fmt.Println("Folder backup initiated")

		c.Response().Header().Set(
			echo.HeaderContentType,
			"application/zip",
		)

		c.Response().Header().Set(
			echo.HeaderContentDisposition,
			fmt.Sprintf(`attachment; filename="%s.zip"`, name),
		)

		zipWriter := zip.NewWriter(c.Response())
		defer func(zipWriter *zip.Writer) {
			err := zipWriter.Close()
			if err != nil {
				fmt.Printf("failed to close zip writer: %v\n", err)
			}
		}(zipWriter)

		err := filepath.Walk(folderPath, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}

			if info.IsDir() {
				return nil
			}

			relPath, err := filepath.Rel(folderPath, path)
			if err != nil {
				return err
			}

			fileInZip, err := zipWriter.Create(relPath)
			if err != nil {
				return err
			}

			file, err := os.Open(path)
			if err != nil {
				return err
			}
			defer func(file *os.File) {
				err := file.Close()
				if err != nil {
					fmt.Printf("failed to close response body: %v\n", err)
				}
			}(file)

			_, err = io.Copy(fileInZip, file)
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
