package services

import (
	"encoding/csv"
	"errors"
	"os"
)

type CategoryService struct {
	ModelService *ModelService
}

func NewCategoryService(ms *ModelService) (*CategoryService, error) {
	err := ms.LoadModel()
	if err != nil {
		return nil, errors.New("failed to load model: " + err.Error())
	}

	return &CategoryService{
		ModelService: ms,
	}, nil
}

func (cs *CategoryService) GetCategory(item string) (string, error) {
	if cs.ModelService.naiveBayes == nil {
		return "", errors.New("model not loaded")
	}

	category, err := cs.ModelService.Predict(item)
	if err != nil {
		return "", err
	}

	return category, nil
}

func (cs *CategoryService) AddCategory(item string, category string) error {
	file, err := os.OpenFile(CategoriesCsv(), os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	err = writer.Write([]string{item, category})
	if err != nil {
		return err
	}

	return nil
}
