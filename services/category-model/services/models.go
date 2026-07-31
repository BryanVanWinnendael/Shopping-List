package services

import (
	"shopping-list/category-model/models"
	sharedModels "shopping-list/shared/models"
)

func NewNaiveBayes() *models.NaiveBayes {
	return &models.NaiveBayes{
		WordCounts:  make(map[sharedModels.Category]map[string]int),
		ClassCounts: make(map[sharedModels.Category]int),
		Vocabulary:  make(map[string]bool),
	}
}
