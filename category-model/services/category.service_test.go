package services

import (
	"errors"
	"os"
	"testing"
)

type MockModelService struct {
	LoadFunc    func() error
	PredictFunc func(item string) (string, error)
}

func TestNewCategoryService(t *testing.T) {
	t.Run("Given valid ModelService, When NewCategoryService, Then success", func(t *testing.T) {
		// given
		mock := &MockModelService{}

		// when
		cs, err := NewCategoryService(mock)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if cs.ModelService == nil {
			t.Fatalf("expected ModelService to be set")
		}
	})

	t.Run("Given ModelService fails to load, When NewCategoryService, Then return error", func(t *testing.T) {
		// given
		mock := &MockModelService{
			LoadFunc: func() error { return errors.New("load fail") },
		}

		// when
		_, err := NewCategoryService(mock)

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}

		expected := "failed to load model: load fail"
		if err.Error() != expected {
			t.Fatalf("expected error '%s', got '%s'", expected, err.Error())
		}
	})
}

func TestGetCategory(t *testing.T) {
	t.Run("Given valid CategoryService, When GetCategory, Then return category", func(t *testing.T) {
		// given
		mock := &MockModelService{}
		cs, _ := NewCategoryService(mock)

		// when
		category, err := cs.GetCategory("item1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if category != "mock-category" {
			t.Fatalf("expected 'mock-category', got '%s'", category)
		}
	})

	t.Run("Given CategoryService with failing Predict, When GetCategory, Then return predict error", func(t *testing.T) {
		// given
		mock := &MockModelService{
			PredictFunc: func(item string) (string, error) {
				return "", errors.New("predict fail")
			},
		}
		cs, _ := NewCategoryService(mock)

		// when
		_, err := cs.GetCategory("item1")

		// then
		if err == nil || err.Error() != "predict fail" {
			t.Fatalf("expected predict fail error, got %v", err)
		}
	})
}

func TestAddCategory(t *testing.T) {
	t.Run("Given temporary CSV file, When AddCategory, Then write correctly", func(t *testing.T) {
		// given
		tmpFile := "test_categories.csv"
		defer removeFile(tmpFile)

		originalCategoriesCsv := CategoriesCsv
		CategoriesCsv = func() string { return tmpFile }
		defer func() { CategoriesCsv = originalCategoriesCsv }()

		cs := &CategoryService{}

		// when
		err := cs.AddCategory("item1", "category1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		data, err := os.ReadFile(tmpFile)
		if err != nil {
			t.Fatalf("failed to read temp file: %v", err)
		}

		expected := "item1,category1\n"
		if string(data) != expected {
			t.Fatalf("expected '%s', got '%s'", expected, string(data))
		}
	})
}

func (m *MockModelService) LoadModel() error {
	if m.LoadFunc != nil {
		return m.LoadFunc()
	}
	return nil
}

func (m *MockModelService) Predict(item string) (string, error) {
	if m.PredictFunc != nil {
		return m.PredictFunc(item)
	}
	return "mock-category", nil
}
