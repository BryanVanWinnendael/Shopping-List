package handlers

import (
	"net/http"
	"shopping-list/cron/models"

	"github.com/labstack/echo/v4"
)

type CronService interface {
	CreateCronItem(item models.CronItem) (string, error)
	GetAllCronItems() ([]models.CronItem, error)
	UpdateCronItemCategory(id string, newCategory string) error
	DeleteCronItem(id string) error
	GetCronItemsByUser(addedBy string) ([]models.CronItem, error)
}

type CronHandler struct {
	CronService CronService
}

func NewCronHandler(cs CronService) *CronHandler {
	return &CronHandler{CronService: cs}
}

func (ch *CronHandler) CreateCronItem(c echo.Context) error {
	var request models.CronItem

	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
	}

	id, err := ch.CronService.CreateCronItem(request)
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
	items, err := ch.CronService.GetAllCronItems()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, items)
}

func (ch *CronHandler) UpdateCronItemCategory(c echo.Context) error {
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

	if err := ch.CronService.UpdateCronItemCategory(idParam, request.Category); err != nil {
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

	if err := ch.CronService.DeleteCronItem(idParam); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "CronItem deleted successfully",
		"id":      idParam,
	})
}

func (ch *CronHandler) GetCronItemsByUser(c echo.Context) error {
	addedBy := c.Param("name")

	items, err := ch.CronService.GetCronItemsByUser(addedBy)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, items)
}
