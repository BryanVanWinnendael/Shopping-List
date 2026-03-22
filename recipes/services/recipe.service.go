package services

import (
	"encoding/json"
	"errors"
	"log"

	"shopping-list/recipes/internal/constants"
	"shopping-list/recipes/models"
	"sort"

	"github.com/google/uuid"
	bolt "go.etcd.io/bbolt"
)

type RecipeService struct {
	db *bolt.DB
}

func NewRecipeService(db *bolt.DB) *RecipeService {
	err := db.Update(func(tx *bolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(constants.RecipesBucket))
		return err
	})
	if err != nil {
		log.Fatalf("Failed to create recipes bucket: %v", err)
	}

	return &RecipeService{db: db}
}

func (s *RecipeService) CreateRecipe(data *models.RecipeCreate) (*models.RecipeResponse, error) {
	recipeID := data.ID
	if recipeID == "" {
		recipeID = uuid.New().String()
	}

	recipe := &models.Recipe{
		ID:        recipeID,
		CreatedBy: data.CreatedBy,
		Title:     data.Title,
		Public:    data.Public,
		Image:     data.Image,
		List:      data.List,
		Source:    data.Source,
		Notes:     data.Notes,
		Time:      data.Time,
		MealType:  data.MealType,
		Country:   data.Country,
	}

	recipeJSON, _ := json.MarshalIndent(recipe, "", "  ")
	err := s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(constants.RecipesBucket))
		return b.Put([]byte(recipe.ID), recipeJSON)
	})
	if err != nil {
		return nil, err
	}

	resp := &models.RecipeResponse{
		ID:        recipe.ID,
		CreatedBy: recipe.CreatedBy,
		Title:     recipe.Title,
		Public:    recipe.Public,
		Image:     recipe.Image,
		List:      convertList(recipe.List),
		Source:    recipe.Source,
		Notes:     recipe.Notes,
		Time:      recipe.Time,
		MealType:  recipe.MealType,
		Country:   recipe.Country,
	}

	return resp, nil
}

func (s *RecipeService) GetRecipe(id string) (*models.RecipeResponse, error) {
	var recipe models.Recipe

	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(constants.RecipesBucket))
		v := b.Get([]byte(id))
		if v == nil {
			return errors.New("recipe not found")
		}
		return json.Unmarshal(v, &recipe)
	})
	if err != nil {
		return nil, err
	}

	resp := models.RecipeResponse{
		ID:        recipe.ID,
		CreatedBy: recipe.CreatedBy,
		Title:     recipe.Title,
		Public:    recipe.Public,
		Image:     recipe.Image,
		List:      convertList(recipe.List),
		Source:    recipe.Source,
		Notes:     recipe.Notes,
		Time:      recipe.Time,
		MealType:  recipe.MealType,
		Country:   recipe.Country,
	}

	return &resp, nil
}

func (s *RecipeService) GetRecipes(skip, limit int) ([]models.RecipeResponse, error) {
	var recipes []models.Recipe

	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(constants.RecipesBucket))
		return b.ForEach(func(_, v []byte) error {
			var r models.Recipe
			if err := json.Unmarshal(v, &r); err != nil {
				return err
			}
			if r.Public != nil && *r.Public {
				recipes = append(recipes, r)
			}
			return nil
		})
	})
	if err != nil {
		return nil, err
	}

	if skip >= len(recipes) {
		return []models.RecipeResponse{}, nil
	}
	end := skip + limit
	if end > len(recipes) {
		end = len(recipes)
	}

	result := make([]models.RecipeResponse, 0, end-skip)
	for _, r := range recipes[skip:end] {
		result = append(result, models.RecipeResponse{
			ID:        r.ID,
			CreatedBy: r.CreatedBy,
			Title:     r.Title,
			Image:     r.Image,
			MealType:  r.MealType,
			Country:   r.Country,
			Time:      r.Time,
		})
	}

	return result, nil
}

func (s *RecipeService) GetRecipesByUser(user string, skip, limit int) ([]models.RecipeResponse, error) {
	var recipes []models.Recipe

	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(constants.RecipesBucket))
		return b.ForEach(func(_, v []byte) error {
			var r models.Recipe
			if err := json.Unmarshal(v, &r); err != nil {
				return err
			}
			if r.CreatedBy == user {
				recipes = append(recipes, r)
			}
			return nil
		})
	})
	if err != nil {
		return nil, err
	}

	if skip >= len(recipes) {
		return []models.RecipeResponse{}, nil
	}
	end := skip + limit
	if end > len(recipes) {
		end = len(recipes)
	}

	result := make([]models.RecipeResponse, 0, end-skip)
	for _, r := range recipes[skip:end] {
		result = append(result, models.RecipeResponse{
			ID:        r.ID,
			CreatedBy: r.CreatedBy,
			Title:     r.Title,
			Public:    r.Public,
			Image:     r.Image,
			List:      convertList(r.List),
			Source:    r.Source,
			Notes:     r.Notes,
			Time:      r.Time,
			MealType:  r.MealType,
			Country:   r.Country,
		})
	}

	return result, nil
}

func (s *RecipeService) UpdateRecipe(id string, data *models.RecipeUpdate) (*models.RecipeResponse, error) {
	var recipe models.Recipe

	err := s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(constants.RecipesBucket))
		v := b.Get([]byte(id))
		if v == nil {
			return errors.New("recipe not found")
		}
		if err := json.Unmarshal(v, &recipe); err != nil {
			return err
		}

		if data.Title != nil {
			recipe.Title = *data.Title
		}
		if data.Public != nil {
			recipe.Public = data.Public
		}
		if data.Image != nil {
			if *data.Image == "remove" {
				recipe.Image = nil
			} else {
				recipe.Image = data.Image
			}
		}
		if data.List != nil {
			recipe.List = *data.List
		}
		if data.Source != nil {
			recipe.Source = data.Source
		}
		if data.Notes != nil {
			recipe.Notes = data.Notes
		}
		if data.Time != nil {
			recipe.Time = data.Time
		}
		if data.MealType != nil {
			recipe.MealType = data.MealType
		}
		if data.Country != nil {
			recipe.Country = data.Country
		}

		updated, _ := json.Marshal(recipe)
		return b.Put([]byte(id), updated)
	})
	if err != nil {
		return nil, err
	}

	resp := &models.RecipeResponse{
		ID:        recipe.ID,
		CreatedBy: recipe.CreatedBy,
		Title:     recipe.Title,
		Public:    recipe.Public,
		Image:     recipe.Image,
		List:      convertList(recipe.List),
		Source:    recipe.Source,
		Notes:     recipe.Notes,
		Time:      recipe.Time,
		MealType:  recipe.MealType,
		Country:   recipe.Country,
	}

	return resp, nil
}

func (s *RecipeService) DeleteRecipe(id string) (bool, error) {
	var existed bool
	err := s.db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(constants.RecipesBucket))
		v := b.Get([]byte(id))
		if v == nil {
			existed = false
			return nil
		}
		existed = true
		return b.Delete([]byte(id))
	})
	return existed, err
}

func (s *RecipeService) GetAllDistinctCountries() ([]string, error) {
	countrySet := make(map[string]struct{})

	err := s.db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(constants.RecipesBucket))
		return b.ForEach(func(_, v []byte) error {
			var r models.Recipe
			if err := json.Unmarshal(v, &r); err != nil {
				return err
			}
			if r.Country != nil && *r.Country != "" {
				countrySet[*r.Country] = struct{}{}
			}
			return nil
		})
	})
	if err != nil {
		return nil, err
	}

	countries := make([]string, 0, len(countrySet))
	for c := range countrySet {
		countries = append(countries, c)
	}

	sort.Strings(countries)

	return countries, nil
}

func convertList(list models.JSONList) []models.RecipeListItem {
	if list == nil {
		return []models.RecipeListItem{}
	}
	items := make([]models.RecipeListItem, len(list))
	for i, v := range list {
		items[i] = models.RecipeListItem(v)
	}
	return items
}
