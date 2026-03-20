package services

import (
	"path/filepath"
	"shopping-list/category-model/internal/config"
)

func CategoriesCsv() string {
	return filepath.Join(config.Vars.DataDir, "categories.csv")
}

func ModelFile() string {
	return filepath.Join(config.Vars.DataDir, "model.pkl")
}
