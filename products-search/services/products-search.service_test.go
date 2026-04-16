package services

import (
	"encoding/csv"
	"os"
	"shopping-list/products-search/internal/config"
	"testing"
)

const tmpCSV = "test.csv"

func TestSearchProducts(t *testing.T) {
	t.Run("Given matching query, When SearchProducts, Then return results", func(t *testing.T) {
		// given
		setupCSV(t, [][]string{
			{"pid", "item", "brand", "category", "image"},
			{"1", "Milk", "BrandA", "dairy", "img"},
			{"2", "Bread", "BrandB", "bakery", "img"},
		})
		defer cleanupFile(t)

		service := NewProductsSearchService()

		// when
		res, err := service.SearchProducts("milk", nil, 1, 10)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if len(res.Products) != 1 {
			t.Fatalf("expected 1 product, got %d", len(res.Products))
		}
	})

	t.Run("Given category filter, When SearchProducts, Then filter results", func(t *testing.T) {
		// given
		setupCSV(t, [][]string{
			{"pid", "item", "brand", "category", "image"},
			{"1", "Milk", "BrandA", "dairy", "img"},
			{"2", "Bread", "BrandB", "bakery", "img"},
		})
		defer cleanupFile(t)

		service := NewProductsSearchService()

		// when
		res, err := service.SearchProducts("a", []string{"bakery"}, 1, 10)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if len(res.Products) != 1 {
			t.Fatalf("expected 1 product, got %d", len(res.Products))
		}
		if res.Products[0].Category != "bakery" {
			t.Fatalf("expected bakery category")
		}
	})

	t.Run("Given no matches, When SearchProducts, Then return empty", func(t *testing.T) {
		// given
		setupCSV(t, [][]string{
			{"pid", "item", "brand", "category", "image"},
		})
		defer cleanupFile(t)

		service := NewProductsSearchService()

		// when
		res, err := service.SearchProducts("milk", nil, 1, 10)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if len(res.Products) != 0 {
			t.Fatalf("expected 0 results, got %d", len(res.Products))
		}
	})
}

func TestFuzzySearch(t *testing.T) {
	t.Run("Given fuzzy match, When FuzzySearch, Then return ranked results", func(t *testing.T) {
		// given
		setupCSV(t, [][]string{
			{"pid", "item", "brand", "category", "image"},
			{"1", "Milk", "BrandA", "dairy", "img"},
			{"2", "Milky Bar", "BrandB", "snack", "img"},
		})
		defer cleanupFile(t)

		service := NewProductsSearchService()

		// when
		res, err := service.FuzzySearch("milk", "", 1, 10)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if len(res.Products) == 0 {
			t.Fatalf("expected results")
		}
	})

	t.Run("Given category filter, When FuzzySearch, Then filter results", func(t *testing.T) {
		// given
		setupCSV(t, [][]string{
			{"pid", "item", "brand", "category", "image"},
			{"1", "Milk", "BrandA", "dairy", "img"},
			{"2", "Milk", "BrandB", "bakery", "img"},
		})
		defer cleanupFile(t)

		service := NewProductsSearchService()

		// when
		res, err := service.FuzzySearch("milk", "dairy", 1, 10)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if len(res.Products) != 1 {
			t.Fatalf("expected 1 result, got %d", len(res.Products))
		}
	})

	t.Run("Given no matches, When FuzzySearch, Then return empty", func(t *testing.T) {
		// given
		setupCSV(t, [][]string{
			{"pid", "item", "brand", "category", "image"},
		})
		defer cleanupFile(t)

		service := NewProductsSearchService()

		// when
		res, err := service.FuzzySearch("milk", "", 1, 10)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if len(res.Products) != 0 {
			t.Fatalf("expected 0 results")
		}
	})
}

func TestPagination(t *testing.T) {
	t.Run("Given many items, When page applied, Then paginate correctly", func(t *testing.T) {
		// given
		setupCSV(t, [][]string{
			{"pid", "item", "brand", "category", "image"},
			{"1", "A", "B", "c", "img"},
			{"2", "B", "B", "c", "img"},
			{"3", "C", "B", "c", "img"},
		})
		defer cleanupFile(t)

		service := NewProductsSearchService()

		// when
		res, err := service.SearchProducts("", nil, 2, 2)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if res.Page != 2 {
			t.Fatalf("expected page 2")
		}
		if len(res.Products) != 1 {
			t.Fatalf("expected 1 item on page 2, got %d", len(res.Products))
		}
	})
}

func setupCSV(t *testing.T, records [][]string) {
	config.Vars.ProductsFile = tmpCSV

	file, err := os.Create(tmpCSV)
	if err != nil {
		t.Fatalf("failed to create csv: %v", err)
	}

	writer := csv.NewWriter(file)
	if err := writer.WriteAll(records); err != nil {
		t.Fatalf("failed to write csv: %v", err)
	}
	writer.Flush()
	err = file.Close()
	if err != nil {
		t.Fatalf("failed to close file: %v", err)
	}
}

func cleanupFile(t *testing.T) {
	err := os.Remove(tmpCSV)
	if err != nil && !os.IsNotExist(err) {
		t.Fatalf("failed to remove file: %v", err)
	}
}
