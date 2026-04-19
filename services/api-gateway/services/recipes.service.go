package services

import (
	"context"
	"fmt"
	"net/http"
	httphelper "shopping-list/api-gateway/http-helper"
	"shopping-list/api-gateway/models"
)

type RecipesService struct {
	client  *httphelper.Client
	baseURL string
}

func NewRecipesService(client *httphelper.Client, baseURL string) *RecipesService {
	return &RecipesService{
		client:  client,
		baseURL: baseURL,
	}
}

func (rs *RecipesService) CreateRecipe(ctx context.Context, request models.Recipe) (*models.Recipe, error) {
	url := rs.baseURL

	var response models.Recipe

	_, err := rs.client.DoRequest(
		ctx,
		http.MethodPost,
		url,
		nil,
		request,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (rs *RecipesService) GetRecipe(ctx context.Context, recipeID string) (*models.Recipe, error) {
	url := fmt.Sprintf("%s/%s", rs.baseURL, recipeID)

	var response models.Recipe

	_, err := rs.client.DoRequest(
		ctx,
		http.MethodGet,
		url,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (rs *RecipesService) DeleteRecipe(ctx context.Context, recipeID string) error {
	url := fmt.Sprintf("%s/%s", rs.baseURL, recipeID)

	_, err := rs.client.DoRequest(
		ctx,
		http.MethodDelete,
		url,
		nil,
		nil,
		nil,
	)

	return err
}

func (rs *RecipesService) GetAllRecipes(ctx context.Context) ([]models.Recipe, error) {
	url := rs.baseURL

	var response []models.Recipe

	_, err := rs.client.DoRequest(
		ctx,
		http.MethodGet,
		url,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return response, nil
}

func (rs *RecipesService) UpdateRecipe(ctx context.Context, recipeID string, request models.Recipe) (*models.Recipe, error) {
	url := fmt.Sprintf("%s/%s", rs.baseURL, recipeID)

	var response models.Recipe

	_, err := rs.client.DoRequest(
		ctx,
		http.MethodPut,
		url,
		nil,
		request,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (rs *RecipesService) GetRecipeByUser(ctx context.Context, user string) ([]models.Recipe, error) {
	url := fmt.Sprintf("%s/user/%s", rs.baseURL, user)

	var response []models.Recipe

	_, err := rs.client.DoRequest(
		ctx,
		http.MethodGet,
		url,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return response, nil
}

func (rs *RecipesService) GetDistinctCountries(ctx context.Context) ([]string, error) {
	url := fmt.Sprintf("%s/countries", rs.baseURL)

	var response []string

	_, err := rs.client.DoRequest(
		ctx,
		http.MethodGet,
		url,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return response, nil
}
