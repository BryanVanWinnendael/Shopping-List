package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"shopping-list/server/internal/config"
	"shopping-list/server/models"
	"time"
)

type RecipeService struct {
	client  *http.Client
	baseURL string
}

func NewRecipeService() *RecipeService {
	return &RecipeService{
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		baseURL: config.Vars.RecipesAPIUrl,
	}
}

func (s *RecipeService) CreateRecipe(
	data models.RecipeCreate,
) ([]byte, int, error) {

	return s.doRequest(
		http.MethodPost,
		"/api/recipes",
		data,
	)
}

func (s *RecipeService) GetRecipe(
	id string,
) ([]byte, int, error) {

	return s.doRequest(
		http.MethodGet,
		fmt.Sprintf("/api/recipes/%s", id),
		nil,
	)
}

func (s *RecipeService) GetRecipes(
	skip, limit int,
) ([]byte, int, error) {

	path := fmt.Sprintf(
		"/api/recipes?skip=%d&limit=%d",
		skip,
		limit,
	)

	return s.doRequest(
		http.MethodGet,
		path,
		nil,
	)
}

func (s *RecipeService) GetRecipesByUser(
	user string,
	skip, limit int,
) ([]byte, int, error) {

	path := fmt.Sprintf(
		"/api/recipes/user/%s?skip=%d&limit=%d",
		user,
		skip,
		limit,
	)

	return s.doRequest(
		http.MethodGet,
		path,
		nil,
	)
}

func (s *RecipeService) UpdateRecipe(
	id string,
	data models.RecipeUpdate,
) ([]byte, int, error) {

	return s.doRequest(
		http.MethodPut,
		fmt.Sprintf("/api/recipes/%s", id),
		data,
	)
}

func (s *RecipeService) DeleteRecipe(
	id string,
) ([]byte, int, error) {

	return s.doRequest(
		http.MethodDelete,
		fmt.Sprintf("/api/recipes/%s", id),
		nil,
	)
}

func (s *RecipeService) GetAllDistinctCountries() ([]byte, int, error) {

	return s.doRequest(
		http.MethodGet,
		"/api/recipes/countries",
		nil,
	)
}

func (s *RecipeService) doRequest(
	method string,
	path string,
	body any,
) ([]byte, int, error) {

	var reqBody io.Reader

	if body != nil {
		b, _ := json.Marshal(body)
		reqBody = bytes.NewBuffer(b)
	}

	req, err := http.NewRequest(
		method,
		fmt.Sprintf("%s%s", s.baseURL, path),
		reqBody,
	)
	if err != nil {
		return nil, 0, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", config.Vars.APIAuthToken)

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	data, err := io.ReadAll(resp.Body)

	return data, resp.StatusCode, err
}
