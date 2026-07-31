package models

import "shopping-list/shared/models"

type NaiveBayes struct {
	WordCounts  map[models.Category]map[string]int
	ClassCounts map[models.Category]int
	Vocabulary  map[string]bool
	TotalDocs   int
}

type TrainingData struct {
	Item     string
	Category models.Category
}

type TrainedModel struct {
	Model    string  `json:"model"`
	Accuracy float64 `json:"accuracy"`
}
