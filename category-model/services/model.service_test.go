package services

import (
	"os"
	"shopping-list/category-model/models"
	"testing"
)

const TMP_CSV = "test_categories.csv"

func TestTrainModel(t *testing.T) {
	t.Run("Given valid CSV, When training model, Then it returns accuracy and creates model file", func(t *testing.T) {
		// given
		tmpModel := "test_model.pkl"

		defer removeFile(TMP_CSV)
		defer removeFile(tmpModel)

		origCsv := CategoriesCsv
		origModel := ModelFile
		CategoriesCsv = func() string { return TMP_CSV }
		ModelFile = func() string { return tmpModel }
		defer func() {
			CategoriesCsv = origCsv
			ModelFile = origModel
		}()

		err := writeTestCSV(TMP_CSV)
		if err != nil {
			t.Fatalf("failed to write test CSV: %v", err)
		}

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

		if _, err := os.Stat(tmpModel); err != nil {
			t.Fatalf("expected model file to be created")
		}
	})
}

func TestLoadModel(t *testing.T) {
	t.Run("Given no model file, When loading, Then it trains and saves model", func(t *testing.T) {
		// given
		tmpModel := "test_model.pkl"

		defer removeFile(TMP_CSV)
		defer removeFile(tmpModel)

		origCsv := CategoriesCsv
		origModel := ModelFile
		CategoriesCsv = func() string { return TMP_CSV }
		ModelFile = func() string { return tmpModel }
		defer func() {
			CategoriesCsv = origCsv
			ModelFile = origModel
		}()

		err := writeTestCSV(TMP_CSV)
		if err != nil {
			t.Fatalf("failed to write test CSV: %v", err)
		}

		nb := createTestNaiveBayes()
		ms := NewModelService(nb)

		// when
		err = ms.LoadModel()

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if _, err := os.Stat(tmpModel); err != nil {
			t.Fatalf("expected model file to be created")
		}
	})

	t.Run("Given existing model file, When loading, Then it decodes successfully", func(t *testing.T) {
		// given
		tmpCsv := "test_categories.csv"
		tmpModel := "test_model.pkl"

		defer removeFile(tmpCsv)
		defer removeFile(tmpModel)

		origCsv := CategoriesCsv
		origModel := ModelFile
		CategoriesCsv = func() string { return tmpCsv }
		ModelFile = func() string { return tmpModel }
		defer func() {
			CategoriesCsv = origCsv
			ModelFile = origModel
		}()

		err := writeTestCSV(tmpCsv)
		if err != nil {
			t.Fatalf("failed to write test CSV: %v", err)
		}

		nb := createTestNaiveBayes()
		ms := NewModelService(nb)

		// when
		_, _ = ms.TrainModel()

		// then
		err = ms.LoadModel()
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})
}

func TestPredict(t *testing.T) {
	t.Run("Given trained model, When predicting, Then it returns category", func(t *testing.T) {
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

	t.Run("Given nil model, When predicting, Then it returns error", func(t *testing.T) {
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
	t.Run("Given text with punctuation, When tokenizing, Then it splits correctly", func(t *testing.T) {
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

func removeFile(path string) {
	if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
		panic("failed to remove file: " + err.Error())
	}
}

func createTestNaiveBayes() *models.NaiveBayes {
	return &models.NaiveBayes{
		ClassCounts: make(map[string]int),
		WordCounts:  make(map[string]map[string]int),
		Vocabulary:  make(map[string]bool),
		TotalDocs:   0,
	}
}

func writeTestCSV(path string) error {
	data := "item,category\napple,fruit\nbanana,fruit\ncarrot,vegetable"
	return os.WriteFile(path, []byte(data), 0644)
}
