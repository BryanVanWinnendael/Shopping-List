package services

import (
	"path/filepath"
	"testing"

	"shopping-list/category-model/internal/config"
)

func TestCategoriesCsv(t *testing.T) {
	t.Run("Given DataDir, When calling CategoriesCsv, Then it returns correct path", func(t *testing.T) {
		// given
		original := config.Vars.DataDir
		config.Vars.DataDir = "testdata"
		defer func() { config.Vars.DataDir = original }()

		// when
		result := CategoriesCsv()

		// then
		expected := filepath.Join("testdata", "categories.csv")
		if result != expected {
			t.Fatalf("expected '%s', got '%s'", expected, result)
		}
	})
}

func TestModelFile(t *testing.T) {
	t.Run("Given DataDir, When calling ModelFile, Then it returns correct path", func(t *testing.T) {
		// given
		original := config.Vars.DataDir
		config.Vars.DataDir = "testdata"
		defer func() { config.Vars.DataDir = original }()

		// when
		result := ModelFile()

		// then
		expected := filepath.Join("testdata", "model.pkl")
		if result != expected {
			t.Fatalf("expected '%s', got '%s'", expected, result)
		}
	})
}
