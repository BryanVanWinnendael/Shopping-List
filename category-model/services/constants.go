package services

import (
	"path/filepath"
	"shopping-list/category-model/internal/config"
)

var CategoriesCsv = func() string {
	return filepath.Join(config.Vars.DataDir, "categories.csv")
}

var ModelFile = func() string {
	return filepath.Join(config.Vars.DataDir, "model.pkl")
}
