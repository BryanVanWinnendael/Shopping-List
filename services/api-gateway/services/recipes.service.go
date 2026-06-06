package services

import (
	"context"
	"fmt"
	"net/http"
	"shopping-list/shared/contracts"
	httphelper "shopping-list/shared/http"
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

func (rs *RecipesService) CreateRecipe(ctx context.Context, request *contracts.CreateRecipeRequest) (*contracts.CreateRecipeResponse, error) {
	requestUrl := fmt.Sprintf("%s/recipes", rs.baseURL)

	var response contracts.CreateRecipeResponse

	_, err := rs.client.DoRequest(
		ctx,
		http.MethodPost,
		requestUrl,
		nil,
		request,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (rs *RecipesService) GetRecipe(ctx context.Context, id string) (*contracts.GetRecipeResponse, error) {
	requestUrl := fmt.Sprintf("%s/recipes/%s", rs.baseURL, id)

	var response contracts.GetRecipeResponse

	_, err := rs.client.DoRequest(
		ctx,
		http.MethodGet,
		requestUrl,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (rs *RecipesService) DeleteRecipe(ctx context.Context, id string) (*contracts.DeleteRecipeResponse, error) {
	requestUrl := fmt.Sprintf("%s/recipes/%s", rs.baseURL, id)

	var response contracts.DeleteRecipeResponse

	_, err := rs.client.DoRequest(
		ctx,
		http.MethodDelete,
		requestUrl,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (rs *RecipesService) GetAllRecipes(ctx context.Context) (*contracts.GetAllRecipesResponse, error) {
	requestUrl := fmt.Sprintf("%s/recipes", rs.baseURL)

	var response contracts.GetAllRecipesResponse

	_, err := rs.client.DoRequest(
		ctx,
		http.MethodGet,
		requestUrl,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (rs *RecipesService) UpdateRecipe(ctx context.Context, id string, request *contracts.UpdateRecipeRequest) (*contracts.UpdateRecipeResponse, error) {
	requestUrl := fmt.Sprintf("%s/recipes/%s", rs.baseURL, id)

	var response contracts.UpdateRecipeResponse

	_, err := rs.client.DoRequest(
		ctx,
		http.MethodPut,
		requestUrl,
		nil,
		request,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (rs *RecipesService) GetRecipesByUser(ctx context.Context, user string) (*contracts.GetRecipesByUserResponse, error) {
	requestUrl := fmt.Sprintf("%s/recipes/users/%s", rs.baseURL, user)

	var response contracts.GetRecipesByUserResponse

	_, err := rs.client.DoRequest(
		ctx,
		http.MethodGet,
		requestUrl,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (rs *RecipesService) GetDistinctCountries(ctx context.Context) (*contracts.GetDistinctCountriesResponse, error) {
	requestUrl := fmt.Sprintf("%s/recipes/countries", rs.baseURL)

	var response contracts.GetDistinctCountriesResponse

	_, err := rs.client.DoRequest(
		ctx,
		http.MethodGet,
		requestUrl,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (rs *RecipesService) GetOnlineRecipes(ctx context.Context, page int) (*contracts.GetOnlineRecipesResponse, error) {
	requestUrl := fmt.Sprintf("%s/online-recipes?page=%d", rs.baseURL, page)

	var response contracts.GetOnlineRecipesResponse

	_, err := rs.client.DoRequest(
		ctx,
		http.MethodGet,
		requestUrl,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (rs *RecipesService) GetOnlineRecipeDetails(ctx context.Context, url string) (*contracts.GetOnlineRecipeDetailsResponse, error) {
	requestUrl := fmt.Sprintf("%s/online-recipes/details?url=%s", rs.baseURL, url)

	var response contracts.GetOnlineRecipeDetailsResponse

	_, err := rs.client.DoRequest(
		ctx,
		http.MethodGet,
		requestUrl,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}

func (rs *RecipesService) SearchOnlineRecipes(ctx context.Context, query string, page int) (*contracts.GetOnlineRecipesResponse, error) {
	requestUrl := fmt.Sprintf("%s/online-recipes/search?q=%s&page=%d", rs.baseURL, query, page)

	var response contracts.GetOnlineRecipesResponse

	_, err := rs.client.DoRequest(
		ctx,
		http.MethodGet,
		requestUrl,
		nil,
		nil,
		&response,
	)

	if err != nil {
		return nil, err
	}

	return &response, nil
}
