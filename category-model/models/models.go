package models

type NaiveBayes struct {
	WordCounts  map[string]map[string]int
	ClassCounts map[string]int
	Vocabulary  map[string]bool
	TotalDocs   int
}

type TrainingData struct {
	Item     string
	Category string
}

