package services

import (
	"os"
	"shopping-list/category-model/internal/config"
	"shopping-list/category-model/models"
	"shopping-list/shared/tests"
	"testing"
)

func TestTrainModel(t *testing.T) {
	t.Run("Given valid CSV, When TrainModel, Then returns accuracy and creates model file", func(t *testing.T) {
		// given
		data := "item,category\napple,fruit\nbanana,fruit\ncarrot,vegetable"
		setupCategories(t, []byte(data))
		setupModel(t)

		nb := createTestNaiveBayes()
		ms := NewModelService(nb)

		// when
		result, err := ms.TrainModel()

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if result["model"] != "NaiveBayes" {
			t.Fatalf("expected model 'NaiveBayes', got %v", result["model"])
		}

		if _, ok := result["accuracy"]; !ok {
			t.Fatalf("expected accuracy in result")
		}

		if _, err := os.Stat(config.Vars.ModelFile); err != nil {
			t.Fatalf("expected model file to be created")
		}
	})

	t.Run("Given existing model file, When TrainModel, Then it decodes successfully", func(t *testing.T) {
		// given
		data := "item,category\napple,fruit\nbanana,fruit\ncarrot,vegetable"
		setupCategories(t, []byte(data))

		nb := createTestNaiveBayes()
		ms := NewModelService(nb)

		// when
		_, _ = ms.TrainModel()

		// then
		err := ms.LoadModel()
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})
}

func TestLoadModel(t *testing.T) {
	t.Run("Given no model file, When LoadModel, Then it trains and saves model", func(t *testing.T) {
		// given
		data := "item,category\napple,fruit\nbanana,fruit\ncarrot,vegetable"
		setupCategories(t, []byte(data))

		nb := createTestNaiveBayes()
		ms := NewModelService(nb)

		// when
		err := ms.LoadModel()

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if _, err := os.Stat(config.Vars.ModelFile); err != nil {
			t.Fatalf("expected model file to be created")
		}
	})
}

func TestPredict(t *testing.T) {
	t.Run("Given trained model, When Predict, Then it returns category", func(t *testing.T) {
		// given
		nb := createTestNaiveBayes()

		data := []models.TrainingData{
			{Item: "apple", Category: "fruit"},
			{Item: "banana", Category: "fruit"},
			{Item: "carrot", Category: "vegetable"},
		}
		train(data, nb)

		ms := NewModelService(nb)

		// when
		category, err := ms.Predict("apple")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if category == "" {
			t.Fatalf("expected category, got empty string")
		}
	})

	t.Run("Given nil model, When Predict, Then it returns error", func(t *testing.T) {
		// given
		ms := &ModelService{}

		// when
		_, err := ms.Predict("apple")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}

func TestTokenize(t *testing.T) {
	t.Run("Given text with punctuation, When tokenize, Then it splits correctly", func(t *testing.T) {
		// given/when
		result := tokenize("Apple, banana. carrot")

		// then
		expected := []string{"apple", "banana", "carrot"}

		if len(result) != len(expected) {
			t.Fatalf("expected %d tokens, got %d", len(expected), len(result))
		}

		for i := range result {
			if result[i] != expected[i] {
				t.Fatalf("expected %s, got %s", expected[i], result[i])
			}
		}
	})
}

func createTestNaiveBayes() *models.NaiveBayes {
	return &models.NaiveBayes{
		ClassCounts: make(map[string]int),
		WordCounts:  make(map[string]map[string]int),
		Vocabulary:  make(map[string]bool),
		TotalDocs:   0,
	}
}

func setupModel(t *testing.T) {
	config.Vars.ModelFile = "test.pkl"
	config.Vars.CategoriesFile = "test.csv"
	tests.SetupFile(t, "test.pkl", nil)

	t.Cleanup(func() { tests.RemoveFile(t, "test.csv") })
}
