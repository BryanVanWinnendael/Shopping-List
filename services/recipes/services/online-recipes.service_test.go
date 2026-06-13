package services

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGetRecipes(t *testing.T) {
	t.Run("Given page greater than one, When GetRecipes, Then append page query", func(t *testing.T) {
		// given
		var receivedPage string

		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			receivedPage = r.URL.Query().Get("page")

			w.Write([]byte(`
				<p class="search-total">1 recipes found</p>

				<div>
					<div class="image">
						<img src="image.jpg">
					</div>

					<div class="info clearfix">
						<h2>
							<a href="/recipe/1">Recipe One</a>
						</h2>
					</div>
				</div>
			`))
		}))
		defer server.Close()

		service := NewOnlineRecipeService(nil, server.URL)

		// when
		_, err := service.GetRecipes(2)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if receivedPage != "3" {
			t.Fatalf("expected page=3, got %s", receivedPage)
		}
	})
}

func TestFetchRecipes(t *testing.T) {
	t.Run("Given invalid total recipes text, When fetchRecipes, Then fallback to recipe count", func(t *testing.T) {
		// given
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte(`
				<p class="search-total">invalid-value</p>

				<div>
					<div class="image">
						<img src="image1.jpg">
					</div>

					<div class="info clearfix">
						<h2>
							<a href="/recipe/1">Recipe One</a>
						</h2>
					</div>
				</div>

				<div>
					<div class="image">
						<img src="image2.jpg">
					</div>

					<div class="info clearfix">
						<h2>
							<a href="/recipe/2">Recipe Two</a>
						</h2>
					</div>
				</div>
			`))
		}))
		defer server.Close()

		// when
		result, err := fetchRecipes(server.URL, 1)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if result.TotalRecipes != 2 {
			t.Fatalf("expected fallback total 2, got %d", result.TotalRecipes)
		}
	})

	t.Run("Given recipe without href, When fetchRecipes, Then skip recipe", func(t *testing.T) {
		// given
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte(`
				<p class="search-total">1 recipes found</p>

				<div>
					<div class="image">
						<img src="image.jpg">
					</div>

					<div class="info clearfix">
						<h2>
							<a>Recipe Without Link</a>
						</h2>
					</div>
				</div>
			`))
		}))
		defer server.Close()

		// when
		result, err := fetchRecipes(server.URL, 1)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if len(result.Recipes) != 0 {
			t.Fatalf("expected recipe to be skipped")
		}
	})
}

func TestGetRecipeDetails(t *testing.T) {
	t.Run("Given valid recipe page, When GetRecipeDetails, Then return parsed recipe", func(t *testing.T) {
		// given
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`
				<html>
					<h1 itemprop="name">Test Recipe</h1>

					<img class="recipe-image" src="image.jpg"/>

					<li itemprop="recipeIngredient">Ingredient 1</li>
					<li itemprop="recipeIngredient">Ingredient 2</li>

					<li itemprop="recipeInstructions">Step 1</li>
					<li itemprop="recipeInstructions">Step 2</li>

					<div itemprop="calories">100 kcal</div>
					<div itemprop="proteinContent">10g</div>

					<div class="duration-container">
						<div class="duration">45 min</div>
					</div>

					<div class="yield-container">
						<div class="yield">4 servings</div>
					</div>
				</html>
			`))
		}))
		defer server.Close()

		service := NewOnlineRecipeService(nil, "")

		// when
		result, err := service.GetRecipeDetails(server.URL)

		// then
		if err != nil {
			t.Fatalf("expected no error got %v", err)
		}

		if result.Title != "Test Recipe" {
			t.Fatalf("unexpected title %s", result.Title)
		}

		if result.Time != 45 {
			t.Fatalf("expected 45 got %d", result.Time)
		}

		if result.Persons != 4 {
			t.Fatalf("expected 4 got %d", result.Persons)
		}

		if len(result.Ingredients) != 2 {
			t.Fatalf("expected 2 ingredients")
		}

		if len(result.Instructions) != 2 {
			t.Fatalf("expected 2 instructions")
		}
	})

	t.Run("Given non 200 response, When GetRecipeDetails, Then return error", func(t *testing.T) {
		// given
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusInternalServerError)
		}))
		defer server.Close()

		service := NewOnlineRecipeService(nil, "")

		// when
		_, err := service.GetRecipeDetails(server.URL)

		// then
		if err == nil {
			t.Fatal("expected error")
		}
	})

	t.Run("Given invalid time and persons, When GetRecipeDetails, Then default to zero", func(t *testing.T) {
		// given
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte(`
				<html>
					<h1 itemprop="name">Recipe</h1>

					<div class="duration-container">
						<div class="duration">abc min</div>
					</div>

					<div class="yield-container">
						<div class="yield">many servings</div>
					</div>
				</html>
			`))
		}))
		defer server.Close()

		service := NewOnlineRecipeService(nil, "")

		// when
		result, err := service.GetRecipeDetails(server.URL)

		// then
		if err != nil {
			t.Fatalf("unexpected error %v", err)
		}

		if result.Time != 0 {
			t.Fatalf("expected 0 got %d", result.Time)
		}

		if result.Persons != 0 {
			t.Fatalf("expected 0 got %d", result.Persons)
		}
	})
	t.Run("Given invalid time and persons, When GetRecipeDetails, Then return zero values", func(t *testing.T) {
		// given
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte(`
				<h1 itemprop="name">Test Recipe</h1>

				<div class="duration-container">
					<div class="duration">ABC MIN</div>
				</div>

				<div class="yield-container">
					<div class="yield">many servings</div>
				</div>
			`))
		}))
		defer server.Close()

		service := NewOnlineRecipeService(nil, "")

		// when
		result, err := service.GetRecipeDetails(server.URL)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if result.Time != 0 {
			t.Fatalf("expected time 0")
		}

		if result.Persons != 0 {
			t.Fatalf("expected persons 0")
		}
	})

	t.Run("Given recipe without nutrition, When GetRecipeDetails, Then return empty nutrition", func(t *testing.T) {
		// given
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte(`
				<h1 itemprop="name">Recipe</h1>
			`))
		}))
		defer server.Close()

		service := NewOnlineRecipeService(nil, "")

		// when
		result, err := service.GetRecipeDetails(server.URL)

		// then
		if err != nil {
			t.Fatalf("expected no error")
		}

		if result.Nutrition.Calories != "" {
			t.Fatalf("expected empty calories")
		}
	})
}

func TestUrlQueryEscape(t *testing.T) {
	t.Run("Given query with spaces, When urlQueryEscape, Then encode correctly", func(t *testing.T) {
		// given/when
		result := urlQueryEscape("chicken soup")

		// then
		if result != "chicken+soup" {
			t.Fatalf("expected chicken+soup, got %s", result)
		}
	})
}
