package utils

import "shopping-list/category-model/models"

func NewNaiveBayes() *models.NaiveBayes {
	return &models.NaiveBayes{
		WordCounts:  make(map[string]map[string]int),
		ClassCounts: make(map[string]int),
		Vocabulary:  make(map[string]bool),
	}
}
