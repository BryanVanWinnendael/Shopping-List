package handlers

import (
	"net/http"
	"shopping-list/shared/contracts"

	"github.com/labstack/echo/v4"
)

type CronService interface {
	CreateCronProduct(request *contracts.CreateCronProductRequest) (*contracts.CreateCronProductResponse, error)
	GetAllCronProducts() (*contracts.GetAllCronProductsResponse, error)
	UpdateCronProductCategory(id string, request *contracts.UpdateCronProductCategoryRequest) (*contracts.UpdateCronProductCategoryResponse, error)
	DeleteCronProduct(id string) (*contracts.DeleteCronProductResponse, error)
	GetCronProductsByUser(user string) (*contracts.GetCronProductsByUserResponse, error)
}

type CronHandler struct {
	CronService CronService
}

func NewCronHandler(cs CronService) *CronHandler {
	return &CronHandler{CronService: cs}
}

func (ch *CronHandler) CreateCronProduct(c echo.Context) error {
	var request contracts.CreateCronProductRequest

	if err := c.Bind(&request); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": err.Error(),
		})
	}

	result, err := ch.CronService.CreateCronProduct(&request)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, result)
}

func (ch *CronHandler) GetAllCronProducts(c echo.Context) error {
	Products, err := ch.CronService.GetAllCronProducts()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, Products)
}

func (ch *CronHandler) UpdateCronProductCategory(c echo.Context) error {
	idParam := c.Param("id")

	var request contracts.UpdateCronProductCategoryRequest
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

	result, err := ch.CronService.UpdateCronProductCategory(idParam, &request)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}
	return c.JSON(http.StatusOK, result)
}

func (ch *CronHandler) DeleteCronProduct(c echo.Context) error {
	idParam := c.Param("id")

	result, err := ch.CronService.DeleteCronProduct(idParam)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, result)
}

func (ch *CronHandler) GetCronProductsByUser(c echo.Context) error {
	user := c.Param("user")

	result, err := ch.CronService.GetCronProductsByUser(user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, result)
}
