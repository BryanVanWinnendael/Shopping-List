package handlers

import (
	"errors"
	"net/http"
	"shopping-list/shared/contracts"
	"shopping-list/shared/tests"
	"testing"
)

type MockModelService struct {
	TrainFunc func() (*contracts.TrainModelResponse, error)
}

func TestTrainModel(t *testing.T) {
	t.Run("Given valid training, When TrainModel, Then returns 200", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/train", nil)

		mock := &MockModelService{}

		handler := NewModelHandler(mock)

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

	t.Run("Given service failure, When TrainModel, Then returns 500", func(t *testing.T) {
		// given
		c, rec := tests.SetupEcho(http.MethodPost, "/train", nil)

		mock := &MockModelService{
			TrainFunc: func() (*contracts.TrainModelResponse, error) {
				return nil, errors.New("training failed")
			},
		}

		handler := NewModelHandler(mock)

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

func (m *MockModelService) TrainModel() (*contracts.TrainModelResponse, error) {
	if m.TrainFunc != nil {
		return m.TrainFunc()
	}
	return &contracts.TrainModelResponse{}, nil
}
