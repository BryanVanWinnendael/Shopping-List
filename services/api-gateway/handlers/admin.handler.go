package handlers

import (
	"archive/zip"
	"io"
	"net/http"
	"shopping-list/api-gateway/response"
	"time"

	"github.com/labstack/echo/v4"
)

type AdminService interface {
}

func NewAdminHandler(cms CategoryModelService, cs CronService, ls LogsService, ns NotificationsService,
	pss ProductsSearchService, rs RecipesService, ss StorageService) *AdminHandler {
	return &AdminHandler{
		CategoryModelService:  cms,
		CronService:           cs,
		LogsService:           ls,
		NotificationsService:  ns,
		ProductsSearchService: pss,
		RecipesService:        rs,
		StorageService:        ss,
	}
}

type AdminHandler struct {
	CategoryModelService  CategoryModelService
	CronService           CronService
	LogsService           LogsService
	NotificationsService  NotificationsService
	ProductsSearchService ProductsSearchService
	RecipesService        RecipesService
	StorageService        StorageService
}

func (ah *AdminHandler) GetBackups(c echo.Context) error {
	ctx := c.Request().Context()

	categoryModelResp, err := ah.CategoryModelService.GetBackup(ctx)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, err.Error())
	}

	cronResp, err := ah.CronService.GetBackup(ctx)
	if err != nil {
		_ = categoryModelResp.Body.Close()
		return response.Error(c, http.StatusBadRequest, err.Error())
	}

	logsResp, err := ah.LogsService.GetBackup(ctx)
	if err != nil {
		_ = categoryModelResp.Body.Close()
		_ = cronResp.Body.Close()
		return response.Error(c, http.StatusBadRequest, err.Error())
	}

	notifResp, err := ah.NotificationsService.GetBackup(ctx)
	if err != nil {
		_ = categoryModelResp.Body.Close()
		_ = cronResp.Body.Close()
		_ = logsResp.Body.Close()
		return response.Error(c, http.StatusBadRequest, err.Error())
	}

	productSearchResp, err := ah.ProductsSearchService.GetBackup(ctx)
	if err != nil {
		_ = categoryModelResp.Body.Close()
		_ = cronResp.Body.Close()
		_ = logsResp.Body.Close()
		_ = notifResp.Body.Close()
		return response.Error(c, http.StatusBadRequest, err.Error())
	}

	recipeResp, err := ah.RecipesService.GetBackup(ctx)
	if err != nil {
		_ = categoryModelResp.Body.Close()
		_ = cronResp.Body.Close()
		_ = logsResp.Body.Close()
		_ = notifResp.Body.Close()
		_ = productSearchResp.Body.Close()
		return response.Error(c, http.StatusBadRequest, err.Error())
	}

	storageResp, err := ah.StorageService.GetBackup(ctx)
	if err != nil {
		_ = categoryModelResp.Body.Close()
		_ = cronResp.Body.Close()
		_ = logsResp.Body.Close()
		_ = notifResp.Body.Close()
		_ = productSearchResp.Body.Close()
		_ = recipeResp.Body.Close()
		return response.Error(c, http.StatusBadRequest, err.Error())
	}

	defer func() {
		_ = categoryModelResp.Body.Close()
		_ = cronResp.Body.Close()
		_ = logsResp.Body.Close()
		_ = notifResp.Body.Close()
		_ = productSearchResp.Body.Close()
		_ = recipeResp.Body.Close()
		_ = storageResp.Body.Close()
	}()

	filename := "shopping-list-backup-" + time.Now().Format("2006-01-02") + ".zip"

	c.Response().Header().Set(echo.HeaderContentType, "application/zip")
	c.Response().Header().Set(
		echo.HeaderContentDisposition,
		`attachment; filename="`+filename+`"`,
	)

	zipWriter := zip.NewWriter(c.Response().Writer)
	defer func() {
		if err := zipWriter.Close(); err != nil {
			c.Logger().Errorf("failed to close zip writer: %v", err)
		}
	}()

	files := []struct {
		name string
		body io.ReadCloser
	}{
		{"category-model.zip", categoryModelResp.Body},
		{"cron.zip", cronResp.Body},
		{"logs.zip", logsResp.Body},
		{"notifications.zip", notifResp.Body},
		{"products-search.zip", productSearchResp.Body},
		{"recipes.zip", recipeResp.Body},
		{"storage.zip", storageResp.Body},
	}

	for _, f := range files {
		w, err := zipWriter.Create(f.name)
		if err != nil {
			return response.Error(c, http.StatusInternalServerError, err.Error())
		}

		if _, err := io.Copy(w, f.body); err != nil {
			return response.Error(c, http.StatusInternalServerError, err.Error())
		}
	}

	return nil
}
