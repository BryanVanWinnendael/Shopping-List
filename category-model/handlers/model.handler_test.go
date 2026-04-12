package handlers

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"
)

type MockModelService struct {
	TrainFunc func() (map[string]interface{}, error)
}

func TestTrainModel(t *testing.T) {
	t.Run("Given valid training, When service succeeds, Then returns 200", func(t *testing.T) {
		// given
		c, rec := setupEcho()

		mock := &MockModelService{
			TrainFunc: func() (map[string]interface{}, error) {
				return map[string]interface{}{
					"model":    "NaiveBayes",
					"accuracy": 0.95,
				}, nil
			},
		}

		handler := newModelHandler(mock)

		// when
		err := handler.TrainModel(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusOK {
			t.Fatalf("expected 200, got %d", rec.Code)
		}

		if rec.Body.Len() == 0 {
			t.Fatalf("expected response body")
		}
	})

	t.Run("Given service failure, When training fails, Then returns 500", func(t *testing.T) {
		// given
		c, rec := setupEcho()

		mock := &MockModelService{
			TrainFunc: func() (map[string]interface{}, error) {
				return nil, errors.New("training failed")
			},
		}

		handler := newModelHandler(mock)

		// when
		err := handler.TrainModel(c)

		// then
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if rec.Code != http.StatusInternalServerError {
			t.Fatalf("expected 500, got %d", rec.Code)
		}
	})
}

func (m *MockModelService) TrainModel() (map[string]interface{}, error) {
	if m.TrainFunc != nil {
		return m.TrainFunc()
	}

	return map[string]interface{}{
		"model":    "mock",
		"accuracy": 1.0,
	}, nil
}

func setupEcho() (echo.Context, *httptest.ResponseRecorder) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/train", nil)
	rec := httptest.NewRecorder()
	return e.NewContext(req, rec), rec
}

func newModelHandler(mock *MockModelService) *ModelHandler {
	return NewModelHandler(mock)
}
