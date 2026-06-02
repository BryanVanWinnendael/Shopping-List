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

type TrainedModel struct {
	Model    string  `json:"model"`
	Accuracy float64 `json:"accuracy"`
}
