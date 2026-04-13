package handlers

import (
	"net/http"
	"shopping-list/cron/models"

	"github.com/labstack/echo/v4"
)

type CronService interface {
	AddCronItem(item models.CronItem) (string, error)
	GetAllCronItems() ([]models.CronItem, error)
	UpdateCategory(id string, newCategory string) error
	Delete(id string) error
	GetCronItemsByAddedBy(addedBy string) ([]models.CronItem, error)
}

type CronHandler struct {
	Service CronService
}

func NewCronHandler(cs CronService) *CronHandler {
	return &CronHandler{Service: cs}
}

func (ch *CronHandler) AddCronItem(c echo.Context) error {
	var request models.CronItem

	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
	}

	id, err := ch.Service.AddCronItem(request)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"id":       id,
		"category": request.Category,
		"addedBy":  request.AddedBy,
		"item":     request.Item,
	})
}

func (ch *CronHandler) GetAllCronItems(c echo.Context) error {
	items, err := ch.Service.GetAllCronItems()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, items)
}

func (ch *CronHandler) UpdateCategory(c echo.Context) error {
	idParam := c.Param("id")

	var request models.UpdateCronItemRequest
	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
	}

	if request.Category == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "category cannot be empty",
		})
	}

	if err := ch.Service.UpdateCategory(idParam, request.Category); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"id":       idParam,
		"category": request.Category,
	})
}

func (ch *CronHandler) DeleteCronItem(c echo.Context) error {
	idParam := c.Param("id")
	if err := ch.Service.Delete(idParam); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "CronItem deleted successfully",
		"id":      idParam,
	})
}

func (ch *CronHandler) GetByAddedBy(c echo.Context) error {
	addedBy := c.Param("name")

	items, err := ch.Service.GetCronItemsByAddedBy(addedBy)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, items)
}
