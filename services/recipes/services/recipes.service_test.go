package services

import (
	"shopping-list/shared/contracts"
	"shopping-list/shared/models"
	"shopping-list/shared/tests"
	"testing"

	"shopping-list/recipes/internal/config"

	"go.etcd.io/bbolt"
)

func TestCreateRecipe(t *testing.T) {
	t.Run("Given valid recipe, When CreateRecipe, Then returns recipe", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		request := contracts.CreateRecipeRequest{
			User:  "user1",
			Title: "Pizza",
		}

		// when
		result, err := service.CreateRecipe(&request)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if result.Id == "" {
			t.Fatalf("expected id to be set")
		}
	})
}

func TestGetRecipe(t *testing.T) {
	t.Run("Given existing recipe, When GetRecipe, Then returns recipe", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		recipe := models.Recipe{Id: "1", Title: "Pizza"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), recipe)

		// when
		result, err := service.GetRecipe("1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if result.Id != "1" {
			t.Fatalf("expected id 1")
		}
	})

	t.Run("Given missing recipe, When GetRecipe, Then returns error", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		// when
		_, err := service.GetRecipe("missing")

		// then
		if err == nil {
			t.Fatalf("expected error, got nil")
		}
	})
}

func TestGetRecipes(t *testing.T) {
	t.Run("Given public and private recipes, When GetRecipes without user, Then returns only public recipes", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		pub := true
		priv := false

		recipe1 := models.Recipe{
			Id:     "1",
			Title:  "Public recipe",
			Public: &pub,
		}

		recipe2 := models.Recipe{
			Id:     "2",
			Title:  "Private recipe",
			Public: &priv,
		}

		tests.Put(t, db, config.Vars.Bucket, []byte("1"), recipe1)
		tests.Put(t, db, config.Vars.Bucket, []byte("2"), recipe2)

		// when
		res, err := service.GetRecipes("", 1)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if res.Total != 1 {
			t.Fatalf("expected 1 recipe, got %d", res.Total)
		}

		if len(res.Recipes) != 1 {
			t.Fatalf("expected 1 recipe in page, got %d", len(res.Recipes))
		}

		if res.Recipes[0].Title != "Public recipe" {
			t.Fatalf("expected public recipe")
		}
	})

	t.Run("Given public and own private recipes, When GetRecipes with user, Then returns both", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		pub := true
		priv := false

		recipe1 := models.Recipe{
			Id:     "1",
			User:   "user1",
			Title:  "Public recipe",
			Public: &pub,
		}

		recipe2 := models.Recipe{
			Id:     "2",
			User:   "user1",
			Title:  "Private recipe",
			Public: &priv,
		}

		recipe3 := models.Recipe{
			Id:     "3",
			User:   "user2",
			Title:  "Other private recipe",
			Public: &priv,
		}

		tests.Put(t, db, config.Vars.Bucket, []byte("1"), recipe1)
		tests.Put(t, db, config.Vars.Bucket, []byte("2"), recipe2)
		tests.Put(t, db, config.Vars.Bucket, []byte("3"), recipe3)

		// when
		res, err := service.GetRecipes("user1", 1)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if res.Total != 2 {
			t.Fatalf("expected 2 recipes, got %d", res.Total)
		}

		if len(res.Recipes) != 2 {
			t.Fatalf("expected 2 recipes in page, got %d", len(res.Recipes))
		}
	})

	t.Run("Given invalid JSON, When GetRecipes, Then returns error", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		tests.Put(
			t,
			db,
			config.Vars.Bucket,
			[]byte("1"),
			[]byte("invalid"),
		)

		// when
		_, err := service.GetRecipes("", 1)

		// then
		if err == nil {
			t.Fatalf("expected error")
		}
	})
}

func TestGetRecipesByUser(t *testing.T) {
	t.Run("Given multiple users, When GetRecipesByUser, Then filters correctly", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		recipe1 := models.Recipe{Id: "1", User: "user1"}
		recipe2 := models.Recipe{Id: "2", User: "user2"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), recipe1)
		tests.Put(t, db, config.Vars.Bucket, []byte("2"), recipe2)

		// when
		res, err := service.GetRecipesByUser("user1")

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(*res) != 1 {
			t.Fatalf("expected 1 recipe, got %d", len(*res))
		}
	})
}

func TestUpdateRecipe(t *testing.T) {
	t.Run("Given existing recipe, When UpdateRecipe, Then updates fields", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		recipe := models.Recipe{Id: "1", Title: "Old"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), recipe)

		newTitle := "New"

		request := contracts.UpdateRecipeRequest{
			Title: newTitle,
		}

		// when
		res, err := service.UpdateRecipe("1", &request)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if res.Title != "New" {
			t.Fatalf("expected updated title")
		}
	})

	t.Run("Given missing recipe, When UpdateRecipe, Then returns error", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		// when
		_, err := service.UpdateRecipe("missing", &contracts.UpdateRecipeRequest{})

		// then
		if err == nil {
			t.Fatalf("expected error")
		}
	})
}

func TestDeleteRecipe(t *testing.T) {
	t.Run("Given existing recipe, When DeleteRecipe, Then returns deleted recipe", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		recipe := models.Recipe{Id: "1"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), recipe)

		// when
		result, err := service.DeleteRecipe("1")

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if result.Id != "1" {
			t.Fatalf("expected id 1")
		}
	})

	t.Run("Given missing recipe, When DeleteRecipe, Then return error", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		// when
		_, err := service.DeleteRecipe("missing")

		// then
		if err == nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if err.Error() != "recipe not found" {
			t.Fatalf("expected error")
		}
	})
}

func TestGetAllDistinctCountries(t *testing.T) {
	t.Run("Given recipes with countries, When GetAllDistinctCountries, Then returns unique sorted list", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		c1 := "BE"
		c2 := "NL"

		recipe1 := models.Recipe{Id: "1", Country: &c1}
		recipe2 := models.Recipe{Id: "2", Country: &c2}
		recipe3 := models.Recipe{Id: "3", Country: &c1}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), recipe1)
		tests.Put(t, db, config.Vars.Bucket, []byte("2"), recipe2)
		tests.Put(t, db, config.Vars.Bucket, []byte("3"), recipe3)

		// when
		result, err := service.GetAllDistinctCountries()

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(*result) != 2 {
			t.Fatalf("expected 2 countries, got %d", len(*result))
		}
	})
}

func TestSearchRecipes(t *testing.T) {
	t.Run("Given recipes, When SearchRecipes with matching query, Then returns matching recipes", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		pub := true

		recipe1 := models.Recipe{
			Id:     "1",
			Title:  "Pizza Margherita",
			Public: &pub,
		}

		recipe2 := models.Recipe{
			Id:     "2",
			Title:  "Pasta Carbonara",
			Public: &pub,
		}

		tests.Put(t, db, config.Vars.Bucket, []byte("1"), recipe1)
		tests.Put(t, db, config.Vars.Bucket, []byte("2"), recipe2)

		// when
		result, err := service.SearchRecipes("", "pizza", 1)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if result.Total != 1 {
			t.Fatalf("expected 1 recipe, got %d", result.Total)
		}

		if len(result.Recipes) != 1 {
			t.Fatalf("expected 1 recipe in result, got %d", len(result.Recipes))
		}

		if result.Recipes[0].Title != "Pizza Margherita" {
			t.Fatalf("expected Pizza Margherita")
		}
	})

	t.Run("Given private recipes, When SearchRecipes, Then excludes private recipes", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		pub := true
		priv := false

		recipe1 := models.Recipe{
			Id:     "1",
			Title:  "Public Pizza",
			Public: &pub,
		}

		recipe2 := models.Recipe{
			Id:     "2",
			Title:  "Private Pizza",
			Public: &priv,
			User:   "user1",
		}

		tests.Put(t, db, config.Vars.Bucket, []byte("1"), recipe1)
		tests.Put(t, db, config.Vars.Bucket, []byte("2"), recipe2)

		// when
		result, err := service.SearchRecipes("", "pizza", 1)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if result.Total != 1 {
			t.Fatalf("expected 1 recipe, got %d", result.Total)
		}

		if result.Recipes[0].Title != "Public Pizza" {
			t.Fatalf("expected public recipe")
		}
	})

	t.Run("Given multiple matches, When SearchRecipes, Then returns correct page", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		pub := true

		for i, title := range []string{
			"Pizza One",
			"Pizza Two",
			"Pizza Three",
		} {
			tests.Put(
				t,
				db,
				config.Vars.Bucket,
				[]byte(string(rune(i+1))),
				models.Recipe{
					Id:     string(rune(i + 1)),
					Title:  title,
					Public: &pub,
				},
			)
		}

		// when
		result, err := service.SearchRecipes("", "pizza", 0)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if result.Total != 3 {
			t.Fatalf("expected total 3, got %d", result.Total)
		}

		if result.Page != 1 {
			t.Fatalf("expected page 1, got %d", result.Page)
		}

		if len(result.Recipes) != 3 {
			t.Fatalf("expected 3 recipes on first page, got %d", len(result.Recipes))
		}
	})

	t.Run("Given invalid JSON, When SearchRecipes, Then returns error", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		tests.Put(
			t,
			db,
			config.Vars.Bucket,
			[]byte("1"),
			[]byte("invalid"),
		)

		// when
		_, err := service.SearchRecipes("", "pizza", 1)

		// then
		if err == nil {
			t.Fatalf("expected error")
		}
	})
}

func setup(t *testing.T) *bbolt.DB {
	config.Vars.Bucket = "test-bucket"
	db := tests.SetupDB(t, "test.db", "test-bucket")
	return db
}
