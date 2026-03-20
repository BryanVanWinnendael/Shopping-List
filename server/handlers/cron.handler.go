package handlers

import (
	"net/http"
	"shopping-list/server/models"

	"github.com/labstack/echo/v4"
)

type CronService interface {
	AddCronItem(item models.CronItem) ([]byte, int, error)
	GetAllCronItems() ([]byte, int, error)
	UpdateCategory(id string, newCategory string) ([]byte, int, error)
	Delete(id string) ([]byte, int, error)
	GetCronItemsByAddedBy(addedBy string) ([]byte, int, error)
}

type CronHandler struct {
	Service CronService
}

func NewCronHandler(cs CronService) *CronHandler {
	return &CronHandler{Service: cs}
}

func (ch *CronHandler) AddCronItem(c echo.Context) error {
	var input models.CronItem

	if err := c.Bind(&input); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": err.Error(),
		})
	}

	body, status, err := ch.Service.AddCronItem(input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": err.Error(),
		})
	}

	return c.Blob(status, echo.MIMEApplicationJSON, body)
}

func (ch *CronHandler) GetAllCronItems(c echo.Context) error {
	body, status, err := ch.Service.GetAllCronItems()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": err.Error(),
		})
	}

	return c.Blob(status, echo.MIMEApplicationJSON, body)
}

func (h *CronHandler) UpdateCategory(c echo.Context) error {
	idParam := c.Param("id")

	var body struct {
		Category string `json:"category"`
	}

	if err := c.Bind(&body); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"error": err.Error(),
		})
	}

	respBody, status, err :=
		h.Service.UpdateCategory(idParam, body.Category)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": err.Error(),
		})
	}

	return c.Blob(status, echo.MIMEApplicationJSON, respBody)
}

func (h *CronHandler) DeleteCronItem(c echo.Context) error {
	idParam := c.Param("id")

	body, status, err := h.Service.Delete(idParam)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": err.Error(),
		})
	}

	return c.Blob(status, echo.MIMEApplicationJSON, body)
}

func (ch *CronHandler) GetByAddedBy(c echo.Context) error {
	addedBy := c.Param("name")

	body, status, err :=
		ch.Service.GetCronItemsByAddedBy(addedBy)

	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"error": err.Error(),
		})
	}

	return c.Blob(status, echo.MIMEApplicationJSON, body)
}
