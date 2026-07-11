package services

import (
	"encoding/json"
	"errors"
	"log"
	"math"
	"shopping-list/recipes/internal/config"
	"shopping-list/shared/contracts"
	"shopping-list/shared/models"
	"strings"

	"sort"

	"github.com/google/uuid"
	"go.etcd.io/bbolt"
)

type RecipeService struct {
	db *bbolt.DB
}

func NewRecipeService(db *bbolt.DB) *RecipeService {
	err := db.Update(func(tx *bbolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(config.Vars.Bucket))
		return err
	})
	if err != nil {
		log.Fatalf("failed to create recipes bucket: %v", err)
	}

	return &RecipeService{db: db}
}

func (rs *RecipeService) CreateRecipe(request *contracts.CreateRecipeRequest) (*contracts.CreateRecipeResponse, error) {
	recipeId := uuid.New().String()
	if request.Id != nil && *request.Id != "" {
		recipeId = *request.Id
	}

	recipe := &models.Recipe{
		Id:           recipeId,
		User:         request.User,
		Title:        request.Title,
		Public:       request.Public,
		Banner:       stringPtrTrimOrNil(request.Banner),
		Ingredients:  normalizeIngredients(request.Ingredients),
		Source:       stringPtrTrimOrNil(request.Source),
		Instructions: normalizeInstructions(request.Instructions),
		Time:         request.Time,
		MealType:     (*models.MealType)(stringPtrTrimOrNil((*string)(request.MealType))),
		Country:      stringPtrTrimOrNil(request.Country),
		Persons:      request.Persons,
	}

	recipeJSON, _ := json.MarshalIndent(recipe, "", "  ")
	err := rs.db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))
		return b.Put([]byte(recipe.Id), recipeJSON)
	})
	if err != nil {
		return nil, err
	}

	return (*contracts.CreateRecipeResponse)(recipe), nil
}

func (rs *RecipeService) GetRecipe(id string) (*contracts.GetRecipeResponse, error) {
	var result contracts.GetRecipeResponse

	err := rs.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))
		v := b.Get([]byte(id))
		if v == nil {
			return errors.New("recipe not found")
		}
		return json.Unmarshal(v, &result)
	})
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (rs *RecipeService) GetRecipes(user string, page int, pageSize int) (*contracts.GetRecipesResponse, error) {
	recipes, err := rs.getVisibleRecipes(user)
	if err != nil {
		return nil, err
	}

	return (*contracts.GetRecipesResponse)(paginateRecipes(recipes, page, pageSize)), nil
}

func (rs *RecipeService) SearchRecipes(user string, query string, page int, pageSize int) (*contracts.SearchRecipesResponse, error) {
	recipes, err := rs.getVisibleRecipes(user)
	if err != nil {
		return nil, err
	}

	query = strings.ToLower(strings.TrimSpace(query))

	filtered := make([]models.RecipeSummary, 0)

	for _, recipe := range recipes {
		if query == "" || strings.Contains(strings.ToLower(recipe.Title), query) {
			filtered = append(filtered, recipe)
		}
	}

	return (*contracts.SearchRecipesResponse)(paginateRecipes(filtered, page, pageSize)), nil
}

func (rs *RecipeService) getVisibleRecipes(user string) ([]models.RecipeSummary, error) {
	var recipes []models.RecipeSummary

	err := rs.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))

		return b.ForEach(func(_, v []byte) error {
			var r models.RecipeSummary

			if err := json.Unmarshal(v, &r); err != nil {
				return err
			}

			// public recipes + own private recipes
			if (r.Public != nil && *r.Public) || (user != "" && r.User == user) {
				recipes = append(recipes, r)
			}

			return nil
		})
	})

	if err != nil {
		return nil, err
	}

	sort.Slice(recipes, func(i, j int) bool {
		iIsOwner := user != "" && recipes[i].User == user
		jIsOwner := user != "" && recipes[j].User == user

		if iIsOwner != jIsOwner {
			return iIsOwner
		}

		return recipes[i].Title < recipes[j].Title
	})

	return recipes, nil
}

func paginateRecipes(recipes []models.RecipeSummary, page int, pageSize int) *contracts.RecipesResponse {
	if page < 1 {
		page = 1
	}

	if pageSize < 1 {
		pageSize = 10
	}

	total := len(recipes)

	start := (page - 1) * pageSize
	end := start + pageSize

	paginated := []models.RecipeSummary{}

	if start < total {
		if end > total {
			end = total
		}

		paginated = recipes[start:end]
	}

	totalPages := 0
	if total > 0 {
		totalPages = int(math.Ceil(float64(total) / float64(pageSize)))
	}

	return &contracts.RecipesResponse{
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
		Recipes:    paginated,
	}
}

// Should always return everything
// Used by FE to add product to recipe
func (rs *RecipeService) GetRecipesByUser(user string) (*contracts.GetRecipesByUserResponse, error) {
	var result contracts.GetRecipesByUserResponse

	err := rs.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))
		if b == nil {
			return errors.New("bucket not found")
		}

		return b.ForEach(func(_, v []byte) error {
			var r models.RecipeSummary
			if err := json.Unmarshal(v, &r); err != nil {
				return err
			}

			if r.User == user {
				result = append(result, r)
			}

			return nil
		})
	})

	if err != nil {
		return nil, err
	}

	sort.Slice(result, func(i, j int) bool {
		return result[i].Title < result[j].Title
	})

	return &result, nil
}

func (rs *RecipeService) UpdateRecipe(id string, request *contracts.UpdateRecipeRequest) (*contracts.UpdateRecipeResponse, error) {
	var recipe contracts.UpdateRecipeResponse

	err := rs.db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))
		v := b.Get([]byte(id))
		if v == nil {
			return errors.New("recipe not found")
		}
		if err := json.Unmarshal(v, &recipe); err != nil {
			return err
		}

		if strings.TrimSpace(request.Title) != "" {
			recipe.Title = request.Title
		}

		if request.Public != nil {
			recipe.Public = request.Public
		}
		if request.Banner != nil {
			trimmed := stringPtrTrimOrNil(request.Banner)
			recipe.Banner = trimmed
		}
		if request.Ingredients != nil {
			recipe.Ingredients = normalizeIngredients(request.Ingredients)
		}
		if request.Source != nil {
			val := stringPtrTrimOrNil(request.Source)
			recipe.Source = val
		}
		if request.Instructions != nil {
			recipe.Instructions = normalizeInstructions(request.Instructions)
		}
		if request.Time != nil {
			recipe.Time = request.Time
		}
		if request.MealType != nil {
			val := stringPtrTrimOrNil((*string)(request.MealType))
			recipe.MealType = (*models.MealType)(val)
		}
		if request.Country != nil {
			val := stringPtrTrimOrNil(request.Country)
			recipe.Country = val
		}
		if request.Persons != nil {
			recipe.Persons = request.Persons
		}

		updated, _ := json.Marshal(recipe)
		return b.Put([]byte(id), updated)
	})
	if err != nil {
		return nil, err
	}

	return &recipe, nil
}

func (rs *RecipeService) DeleteRecipe(id string) (*contracts.DeleteRecipeResponse, error) {
	var existed bool
	err := rs.db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))
		v := b.Get([]byte(id))
		if v == nil {
			existed = false
			return nil
		}
		existed = true
		return b.Delete([]byte(id))
	})

	if err != nil {
		return nil, err
	}

	if !existed {
		return nil, errors.New("recipe not found")
	}

	return &contracts.DeleteRecipeResponse{
		Id:      id,
		Message: "recipe deleted",
	}, err
}

func (rs *RecipeService) GetAllDistinctCountries() (*contracts.GetDistinctCountriesResponse, error) {
	countrySet := make(map[string]struct{})

	err := rs.db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte(config.Vars.Bucket))
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

	response := contracts.GetDistinctCountriesResponse(countries)
	return &response, nil
}

func normalizeIngredients(ingredients []models.Ingredient) []models.Ingredient {
	result := make([]models.Ingredient, 0, len(ingredients))

	for _, ingredient := range ingredients {
		url := stringPtrTrimOrNil(ingredient.URL)
		product := stringPtrTrimOrNil(ingredient.Product)

		if url == nil && product == nil {
			continue
		}

		result = append(result, models.Ingredient{
			URL:     url,
			Product: product,
			Type:    ingredient.Type,
		})
	}

	return result
}

func normalizeInstructions(instructions []string) []string {
	result := make([]string, 0, len(instructions))

	for _, instruction := range instructions {
		trimmed := strings.TrimSpace(instruction)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}

	return result
}

func stringPtrTrimOrNil(s *string) *string {
	if s == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*s)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}
