package services

import (
	"shopping-list/shared/tests"
	"testing"

	"shopping-list/recipes/internal/config"
	"shopping-list/recipes/models"

	"go.etcd.io/bbolt"
)

func TestCreateRecipe(t *testing.T) {
	t.Run("Given valid recipe, When CreateRecipe, Then returns recipe", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		data := &models.RecipeCreate{
			CreatedBy: "user1",
			Title:     "Pizza",
		}

		// when
		resp, err := service.CreateRecipe(data)

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if resp.ID == "" {
			t.Fatalf("expected id to be set")
		}
	})
}

func TestGetRecipe(t *testing.T) {
	t.Run("Given existing recipe, When GetRecipe, Then returns recipe", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		recipe := models.Recipe{ID: "1", Title: "Pizza"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), recipe)

		// when
		resp, err := service.GetRecipe("1")

		// then
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if resp.ID != "1" {
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

func TestGetAllRecipes(t *testing.T) {
	t.Run("Given public and private recipes, When GetAllRecipes, Then returns only public", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		pub := true
		priv := false

		recipe1 := models.Recipe{ID: "1", Title: "A", Public: &pub}
		recipe2 := models.Recipe{ID: "2", Title: "B", Public: &priv}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), recipe1)
		tests.Put(t, db, config.Vars.Bucket, []byte("2"), recipe2)

		// when
		res, err := service.GetAllRecipes(0, 10)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(res) != 1 {
			t.Fatalf("expected 1 public recipe, got %d", len(res))
		}
	})

	t.Run("Given invalid JSON, When GetAllRecipes, Then returns error", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)
		invalidJson := []byte("invalid")
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), invalidJson)

		// when
		_, err := service.GetAllRecipes(0, 10)

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

		recipe1 := models.Recipe{ID: "1", CreatedBy: "user1"}
		recipe2 := models.Recipe{ID: "2", CreatedBy: "user2"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), recipe1)
		tests.Put(t, db, config.Vars.Bucket, []byte("2"), recipe2)

		// when
		res, err := service.GetRecipesByUser("user1", 0, 10)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(res) != 1 {
			t.Fatalf("expected 1 recipe, got %d", len(res))
		}
	})
}

func TestUpdateRecipe(t *testing.T) {
	t.Run("Given existing recipe, When UpdateRecipe, Then updates fields", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		recipe := models.Recipe{ID: "1", Title: "Old"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), recipe)

		newTitle := "New"

		// when
		res, err := service.UpdateRecipe("1", &models.RecipeUpdate{
			Title: &newTitle,
		})

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
		_, err := service.UpdateRecipe("missing", &models.RecipeUpdate{})

		// then
		if err == nil {
			t.Fatalf("expected error")
		}
	})
}

func TestDeleteRecipe(t *testing.T) {
	t.Run("Given existing recipe, When DeleteRecipe, Then returns true", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		recipe := models.Recipe{ID: "1"}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), recipe)

		// when
		ok, err := service.DeleteRecipe("1")

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if !ok {
			t.Fatalf("expected true")
		}
	})

	t.Run("Given missing recipe, When DeleteRecipe, Then returns false", func(t *testing.T) {
		// given
		db := setup(t)

		service := NewRecipeService(db)

		// when
		ok, err := service.DeleteRecipe("missing")

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if ok {
			t.Fatalf("expected false")
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

		recipe1 := models.Recipe{ID: "1", Country: &c1}
		recipe2 := models.Recipe{ID: "2", Country: &c2}
		recipe3 := models.Recipe{ID: "3", Country: &c1}
		tests.Put(t, db, config.Vars.Bucket, []byte("1"), recipe1)
		tests.Put(t, db, config.Vars.Bucket, []byte("2"), recipe2)
		tests.Put(t, db, config.Vars.Bucket, []byte("3"), recipe3)

		// when
		res, err := service.GetAllDistinctCountries()

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(res) != 2 {
			t.Fatalf("expected 2 countries, got %d", len(res))
		}
	})
}

func setup(t *testing.T) *bbolt.DB {
	config.Vars.Bucket = "test-bucket"
	db := tests.SetupDB(t, "test.db", "test-bucket")
	return db
}
