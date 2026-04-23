package services

import (
	"encoding/csv"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"shopping-list/category-model/internal/config"
)

type Modeler interface {
	LoadModel() error
	Predict(item string) (string, error)
}

type CategoryService struct {
	ModelService Modeler
}

func NewCategoryService(ms Modeler) (*CategoryService, error) {
	if err := ms.LoadModel(); err != nil {
		return nil, errors.New("failed to load model: " + err.Error())
	}
	return &CategoryService{ModelService: ms}, nil
}

func (cs *CategoryService) GetCategory(item string) (string, error) {
	category, err := cs.ModelService.Predict(item)
	if err != nil {
		return "", err
	}
	return category, nil
}

func (cs *CategoryService) CreateCategory(item string, category string) error {
	categoriesPath := filepath.Join(config.Vars.DataDir, config.Vars.CategoriesFile)
	file, err := os.OpenFile(categoriesPath, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0644)
	if err != nil {
		return err
	}
	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			fmt.Println("Failed to close file:", err)
		}
	}(file)

	writer := csv.NewWriter(file)
	defer writer.Flush()

	if err := writer.Write([]string{item, category}); err != nil {
		return err
	}

	return nil
}
