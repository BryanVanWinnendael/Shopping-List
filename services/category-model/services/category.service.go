package services

import (
	"encoding/csv"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"shopping-list/category-model/internal/config"
	"shopping-list/shared/contracts"
)

type Modeler interface {
	LoadModel() error
	Predict(product string) (string, error)
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

func (cs *CategoryService) GetCategory(product string) (*contracts.GetCategoryResponse, error) {
	category, err := cs.ModelService.Predict(product)
	if err != nil {
		return nil, err
	}
	return &contracts.GetCategoryResponse{
		Category: category,
		Product:  product,
	}, nil
}

func (cs *CategoryService) CreateCategory(request *contracts.CreateCategoryRequest) (*contracts.CreateCategoryResponse, error) {
	categoriesPath := filepath.Join(config.Vars.DataDir, config.Vars.CategoriesFile)
	file, err := os.OpenFile(categoriesPath, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0644)
	if err != nil {
		return nil, err
	}
	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			fmt.Println("failed to close file:", err)
		}
	}(file)

	writer := csv.NewWriter(file)
	defer writer.Flush()

	if err := writer.Write([]string{request.Product, request.Category}); err != nil {
		return nil, err
	}

	return &contracts.CreateCategoryResponse{
		Category: request.Category,
		Product:  request.Product,
	}, nil
}
