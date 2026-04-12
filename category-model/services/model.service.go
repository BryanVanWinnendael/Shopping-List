package services

import (
	"encoding/csv"
	"encoding/gob"
	"errors"
	"fmt"
	"math"
	"os"
	"shopping-list/category-model/models"
	"strings"
)

type ModelService struct {
	naiveBayes *models.NaiveBayes
}

func NewModelService(naiveBayes *models.NaiveBayes) *ModelService {
	return &ModelService{
		naiveBayes: naiveBayes,
	}
}

func (ms *ModelService) TrainModel() (map[string]any, error) {
	data, err := loadCSV()
	if err != nil {
		return nil, err
	}

	train(data, ms.naiveBayes)

	file, err := os.Create(ModelFile())
	if err != nil {
		return nil, err
	}
	defer closeFile(file)

	encoder := gob.NewEncoder(file)
	if err := encoder.Encode(ms.naiveBayes); err != nil {
		return nil, err
	}

	correct := 0
	for _, d := range data {
		pred := getBestClass(d.Item, ms.naiveBayes)
		if pred == d.Category {
			correct++
		}
	}
	accuracy := float64(correct) / float64(len(data))

	result := map[string]interface{}{
		"model":    "NaiveBayes",
		"accuracy": accuracy,
	}

	return result, nil
}

func (ms *ModelService) LoadModel() error {
	modelFile := ModelFile()

	file, err := os.Open(modelFile)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return ms.trainAndSave()
		}
		return err
	}
	defer closeFile(file)

	return gob.NewDecoder(file).Decode(ms.naiveBayes)
}

func (ms *ModelService) trainAndSave() error {
	_, err := ms.TrainModel()
	return err
}

func (ms *ModelService) Predict(item string) (string, error) {
	if ms.naiveBayes == nil {

		return "", errors.New("model not loaded, call TrainModel or LoadModel first")
	}
	return getBestClass(item, ms.naiveBayes), nil
}

func getBestClass(text string, nb *models.NaiveBayes) string {
	maxScore := -1e9
	bestClass := ""

	for class := range nb.ClassCounts {
		score := math.Log(float64(nb.ClassCounts[class]) / float64(nb.TotalDocs))

		for _, word := range tokenize(text) {
			wordCount := nb.WordCounts[class][word]
			score += math.Log(float64(wordCount+1) / float64(nb.ClassCounts[class]+len(nb.Vocabulary)))
		}

		if score > maxScore || bestClass == "" {
			maxScore = score
			bestClass = class
		}
	}

	return bestClass
}

func train(data []models.TrainingData, nb *models.NaiveBayes) {
	for _, d := range data {
		nb.ClassCounts[d.Category]++
		nb.TotalDocs++

		if _, ok := nb.WordCounts[d.Category]; !ok {
			nb.WordCounts[d.Category] = make(map[string]int)
		}

		for _, word := range tokenize(d.Item) {
			nb.WordCounts[d.Category][word]++
			nb.Vocabulary[word] = true
		}
	}
}

func tokenize(text string) []string {
	text = strings.ToLower(text)
	text = strings.ReplaceAll(text, ",", "")
	text = strings.ReplaceAll(text, ".", "")
	return strings.Fields(text)
}

func loadCSV() ([]models.TrainingData, error) {
	file, err := os.Open(CategoriesCsv())
	if err != nil {
		return nil, err
	}
	defer closeFile(file)

	reader := csv.NewReader(file)
	records, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}

	if len(records) < 2 {
		return nil, errors.New("CSV must have header + data")
	}

	var data []models.TrainingData
	for i, rec := range records {
		if i == 0 {
			continue
		}
		if len(rec) < 2 {
			continue
		}
		data = append(data, models.TrainingData{
			Item:     rec[0],
			Category: rec[1],
		})
	}
	return data, nil
}

func closeFile(file *os.File) {
	err := file.Close()
	if err != nil {
		fmt.Println("Failed to close file:", err)
	}
}
