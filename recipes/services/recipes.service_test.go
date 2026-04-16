package services

import (
	"encoding/json"
	"os"
	"testing"

	"shopping-list/recipes/internal/config"
	"shopping-list/recipes/models"

	"go.etcd.io/bbolt"
)

const tmpDB = "test.db"

func TestCreateRecipe(t *testing.T) {
	t.Run("Given valid recipe, When CreateRecipe, Then returns recipe", func(t *testing.T) {
		// given
		db := setupDB(t)
		defer cleanupDB(t, db)

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
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := NewRecipeService(db)

		recipe := models.Recipe{ID: "1", Title: "Pizza"}
		b, _ := json.Marshal(recipe)

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			return tx.Bucket([]byte(config.Vars.Bucket)).Put([]byte("1"), b)
		})

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
		db := setupDB(t)
		defer cleanupDB(t, db)

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
	t.Run("Given public and private recipes, When GetRecipes, Then returns only public", func(t *testing.T) {
		// given
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := NewRecipeService(db)

		pub := true
		priv := false

		r1 := models.Recipe{ID: "1", Title: "A", Public: &pub}
		r2 := models.Recipe{ID: "2", Title: "B", Public: &priv}

		b1, _ := json.Marshal(r1)
		b2, _ := json.Marshal(r2)

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			b := tx.Bucket([]byte(config.Vars.Bucket))
			_ = b.Put([]byte("1"), b1)
			_ = b.Put([]byte("2"), b2)
			return nil
		})

		// when
		res, err := service.GetRecipes(0, 10)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if len(res) != 1 {
			t.Fatalf("expected 1 public recipe, got %d", len(res))
		}
	})
}

func TestGetRecipesByUser(t *testing.T) {
	t.Run("Given multiple users, When GetRecipesByUser, Then filters correctly", func(t *testing.T) {
		// given
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := NewRecipeService(db)

		r1 := models.Recipe{ID: "1", CreatedBy: "user1"}
		r2 := models.Recipe{ID: "2", CreatedBy: "user2"}

		b1, _ := json.Marshal(r1)
		b2, _ := json.Marshal(r2)

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			b := tx.Bucket([]byte(config.Vars.Bucket))
			_ = b.Put([]byte("1"), b1)
			_ = b.Put([]byte("2"), b2)
			return nil
		})

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
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := NewRecipeService(db)

		recipe := models.Recipe{ID: "1", Title: "Old"}
		b, _ := json.Marshal(recipe)

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			return tx.Bucket([]byte(config.Vars.Bucket)).Put([]byte("1"), b)
		})

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
		db := setupDB(t)
		defer cleanupDB(t, db)

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
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := NewRecipeService(db)

		r := models.Recipe{ID: "1"}
		b, _ := json.Marshal(r)

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			return tx.Bucket([]byte(config.Vars.Bucket)).Put([]byte("1"), b)
		})

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
		db := setupDB(t)
		defer cleanupDB(t, db)

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
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := NewRecipeService(db)

		c1 := "BE"
		c2 := "NL"

		r1 := models.Recipe{ID: "1", Country: &c1}
		r2 := models.Recipe{ID: "2", Country: &c2}
		r3 := models.Recipe{ID: "3", Country: &c1}

		b1, _ := json.Marshal(r1)
		b2, _ := json.Marshal(r2)
		b3, _ := json.Marshal(r3)

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			b := tx.Bucket([]byte(config.Vars.Bucket))
			_ = b.Put([]byte("1"), b1)
			_ = b.Put([]byte("2"), b2)
			_ = b.Put([]byte("3"), b3)
			return nil
		})

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

func TestGetRecipes_UnmarshalError(t *testing.T) {
	t.Run("Given invalid JSON, When GetRecipes, Then returns error", func(t *testing.T) {
		// given
		db := setupDB(t)
		defer cleanupDB(t, db)

		service := NewRecipeService(db)

		mustUpdate(t, db, func(tx *bbolt.Tx) error {
			return tx.Bucket([]byte(config.Vars.Bucket)).Put([]byte("1"), []byte("invalid"))
		})

		// when
		_, err := service.GetRecipes(0, 10)

		// then
		if err == nil {
			t.Fatalf("expected error")
		}
	})
}

func setupDB(t *testing.T) *bbolt.DB {
	db, err := bbolt.Open(tmpDB, 0600, nil)
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}

	bucket := "test-bucket"

	err = db.Update(func(tx *bbolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte(bucket))
		return err
	})
	if err != nil {
		t.Fatalf("failed to create bucket: %v", err)
	}

	config.Vars.Bucket = bucket

	return db
}

func cleanupDB(t *testing.T, db *bbolt.DB) {
	err := db.Close()
	if err != nil {
		t.Fatalf("failed to close db: %v", err)
	}

	if err := os.Remove(tmpDB); err != nil && !os.IsNotExist(err) {
		t.Fatalf("failed to remove db file: %v", err)
	}
}

func mustUpdate(t *testing.T, db *bbolt.DB, fn func(tx *bbolt.Tx) error) {
	err := db.Update(fn)
	if err != nil {
		t.Fatalf("db update failed: %v", err)
	}
}
