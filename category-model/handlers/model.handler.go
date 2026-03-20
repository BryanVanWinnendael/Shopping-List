package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type ModelService interface {
	TrainModel() (map[string]interface{}, error)
}

type ModelHandler struct {
	ModelService ModelService
}

func NewModelHandler(cms ModelService) *ModelHandler {
	return &ModelHandler{ModelService: cms}
}

func (cms *ModelHandler) TrainModel(c echo.Context) error {
	result, err := cms.ModelService.TrainModel()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Error training model: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, result)
}
