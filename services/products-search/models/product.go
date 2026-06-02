package models

import "shopping-list/shared/models"

type ScoredProduct struct {
	ProductObject models.Product
	Score         int
	Category      string
	Product       string
}
