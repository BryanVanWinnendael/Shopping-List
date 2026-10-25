package services

import (
	"net/http"
	"net/http/httptest"
	"shopping-list/shared/models"
	"testing"
)

func TestGetOnlineRecipes(t *testing.T) {
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
		_, err := service.GetRecipes(models.OnlineRecipeFilter{}, 2)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if receivedPage != "3" {
			t.Fatalf("expected page=3, got %s", receivedPage)
		}
	})

	t.Run("Given kitchens, When GetRecipes, Then search with an empty query", func(t *testing.T) {
		// given
		var path string
		var query []string
		var kitchens []string

		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			path = r.URL.Path
			query = r.URL.Query()["q"]
			kitchens = r.URL.Query()["kitchen[]"]

			w.Write([]byte(`<p class="search-total">1 recipes found</p>`))
		}))
		defer server.Close()

		service := NewOnlineRecipeService(nil, server.URL+"/recepten")

		// when
		_, err := service.GetRecipes(models.OnlineRecipeFilter{Kitchens: []string{"frans"}}, 0)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if path != "/recepten/search" {
			t.Fatalf("expected /recepten/search, got %s", path)
		}

		if len(query) != 1 || query[0] != "" {
			t.Fatalf("expected an empty q param, got %v", query)
		}

		if len(kitchens) != 1 || kitchens[0] != "frans" {
			t.Fatalf("expected frans, got %v", kitchens)
		}
	})

	t.Run("Given kitchens, When GetRecipes, Then convert the page to 1-based", func(t *testing.T) {
		// given
		var receivedPage string

		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			receivedPage = r.URL.Query().Get("page")

			w.Write([]byte(`<p class="search-total">1 recipes found</p>`))
		}))
		defer server.Close()

		service := NewOnlineRecipeService(nil, server.URL)

		// when
		result, err := service.GetRecipes(models.OnlineRecipeFilter{Kitchens: []string{"frans"}}, 2)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if receivedPage != "3" {
			t.Fatalf("expected page=3, got %s", receivedPage)
		}

		// the response must stay 0-based, or infinite scroll skips pages
		if result.Page != 2 {
			t.Fatalf("expected page 2 in the response, got %d", result.Page)
		}
	})

	t.Run("Given no kitchens, When GetRecipes, Then stay on the plain browse url", func(t *testing.T) {
		// given
		var path string

		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			path = r.URL.Path

			w.Write([]byte(`<p class="search-total">1 recipes found</p>`))
		}))
		defer server.Close()

		service := NewOnlineRecipeService(nil, server.URL+"/recepten")

		// when
		_, err := service.GetRecipes(models.OnlineRecipeFilter{}, 0)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if path != "/recepten" {
			t.Fatalf("expected /recepten, got %s", path)
		}
	})
}

func TestSearchOnlineRecipesFilters(t *testing.T) {
	t.Run("Given kitchens and query, When SearchRecipes, Then forward all as separate params", func(t *testing.T) {
		// given
		var receivedQuery []string
		var receivedKitchens []string

		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			receivedQuery = r.URL.Query()["q"]
			receivedKitchens = r.URL.Query()["kitchen[]"]

			w.Write([]byte(`<p class="search-total">1 recipes found</p>`))
		}))
		defer server.Close()

		service := NewOnlineRecipeService(nil, server.URL)

		// when
		_, err := service.SearchRecipes("chicken & rice", models.OnlineRecipeFilter{Kitchens: []string{"aziatisch", "  ", "thais"}}, 1)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if len(receivedQuery) != 1 || receivedQuery[0] != "chicken & rice" {
			t.Fatalf("expected escaped query, got %v", receivedQuery)
		}

		if len(receivedKitchens) != 2 || receivedKitchens[0] != "aziatisch" || receivedKitchens[1] != "thais" {
			t.Fatalf("expected aziatisch + thais, got %v", receivedKitchens)
		}
	})

	t.Run("Given no kitchens, When SearchRecipes, Then send none", func(t *testing.T) {
		// given
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if len(r.URL.Query()["kitchen[]"]) != 0 {
				t.Fatalf("expected no kitchen params, got %v", r.URL.Query()["kitchen[]"])
			}

			w.Write([]byte(`<p class="search-total">1 recipes found</p>`))
		}))
		defer server.Close()

		service := NewOnlineRecipeService(nil, server.URL)

		// when
		_, err := service.SearchRecipes("chicken", models.OnlineRecipeFilter{}, 1)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Given kitchens and courses, When SearchRecipes, Then forward both groups", func(t *testing.T) {
		// given
		var receivedKitchens []string
		var receivedCourses []string

		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			receivedKitchens = r.URL.Query()["kitchen[]"]
			receivedCourses = r.URL.Query()["course[]"]

			w.Write([]byte(`<p class="search-total">1 recipes found</p>`))
		}))
		defer server.Close()

		service := NewOnlineRecipeService(nil, server.URL)

		// when
		_, err := service.SearchRecipes("", models.OnlineRecipeFilter{
			Kitchens: []string{"frans"},
			Courses:  []string{"hoofdgerecht", "dessert", ""},
		}, 1)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if len(receivedKitchens) != 1 || receivedKitchens[0] != "frans" {
			t.Fatalf("expected frans, got %v", receivedKitchens)
		}

		// blank entries are dropped, so only the two real courses go out
		if len(receivedCourses) != 2 || receivedCourses[0] != "hoofdgerecht" || receivedCourses[1] != "dessert" {
			t.Fatalf("expected hoofdgerecht + dessert, got %v", receivedCourses)
		}
	})

	t.Run("Given all four groups, When SearchRecipes, Then forward each as its own param", func(t *testing.T) {
		// given
		var received map[string][]string

		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			received = r.URL.Query()

			w.Write([]byte(`<p class="search-total">1 recipes found</p>`))
		}))
		defer server.Close()

		service := NewOnlineRecipeService(nil, server.URL)

		// when
		_, err := service.SearchRecipes("", models.OnlineRecipeFilter{
			Kitchens: []string{"frans"},
			Courses:  []string{"hoofdgerecht"},
			Dishes:   []string{"sushi", "stoofpot"},
			Specials: []string{"vegan", "zoutarm"},
		}, 1)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		for key, want := range map[string][]string{
			"kitchen[]": {"frans"},
			"course[]":  {"hoofdgerecht"},
			"dish[]":    {"sushi", "stoofpot"},
			"special[]": {"vegan", "zoutarm"},
		} {
			got := received[key]

			if len(got) != len(want) {
				t.Fatalf("expected %v for %s, got %v", want, key, got)
			}

			for i := range want {
				if got[i] != want[i] {
					t.Fatalf("expected %v for %s, got %v", want, key, got)
				}
			}
		}
	})

	t.Run("Given only specials, When GetRecipes, Then search with an empty query", func(t *testing.T) {
		// given
		var path string
		var receivedSpecials []string

		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			path = r.URL.Path
			receivedSpecials = r.URL.Query()["special[]"]

			w.Write([]byte(`<p class="search-total">1 recipes found</p>`))
		}))
		defer server.Close()

		service := NewOnlineRecipeService(nil, server.URL+"/recepten")

		// when
		_, err := service.GetRecipes(models.OnlineRecipeFilter{Specials: []string{"vegetarisch"}}, 0)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if path != "/recepten/search" {
			t.Fatalf("expected /recepten/search, got %s", path)
		}

		if len(receivedSpecials) != 1 || receivedSpecials[0] != "vegetarisch" {
			t.Fatalf("expected vegetarisch, got %v", receivedSpecials)
		}
	})

	t.Run("Given only courses, When GetRecipes, Then search with an empty query", func(t *testing.T) {
		// given
		var path string
		var receivedCourses []string

		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			path = r.URL.Path
			receivedCourses = r.URL.Query()["course[]"]

			w.Write([]byte(`<p class="search-total">1 recipes found</p>`))
		}))
		defer server.Close()

		service := NewOnlineRecipeService(nil, server.URL+"/recepten")

		// when
		_, err := service.GetRecipes(models.OnlineRecipeFilter{Courses: []string{"ontbijt"}}, 0)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if path != "/recepten/search" {
			t.Fatalf("expected /recepten/search, got %s", path)
		}

		if len(receivedCourses) != 1 || receivedCourses[0] != "ontbijt" {
			t.Fatalf("expected ontbijt, got %v", receivedCourses)
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

func TestFetchRecipesEmptyTotal(t *testing.T) {
	t.Run("Given page without search-total, When fetchRecipes, Then fallback instead of panicking", func(t *testing.T) {
		// given
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte(`
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
			`))
		}))
		defer server.Close()

		// when
		result, err := fetchRecipes(server.URL, 1)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}

		if result.TotalRecipes != 1 {
			t.Fatalf("expected fallback total 1, got %d", result.TotalRecipes)
		}
	})
}
