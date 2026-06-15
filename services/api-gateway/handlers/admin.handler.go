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

func NewAdminHandler(cs CronService, ns NotificationsService, rs RecipesService) *AdminHandler {
	return &AdminHandler{CronService: cs, NotificationsService: ns, RecipesService: rs}
}

type AdminHandler struct {
	CronService          CronService
	NotificationsService NotificationsService
	RecipesService       RecipesService
}

func (ah *AdminHandler) GetBackups(c echo.Context) error {
	ctx := c.Request().Context()

	cronResp, err := ah.CronService.GetBackup(ctx)
	if err != nil {
		return response.Error(c, http.StatusBadRequest, err.Error())
	}

	notifResp, err := ah.NotificationsService.GetBackup(ctx)
	if err != nil {
		_ = cronResp.Body.Close()
		return response.Error(c, http.StatusBadRequest, err.Error())
	}

	recipeResp, err := ah.RecipesService.GetBackup(ctx)
	if err != nil {
		_ = cronResp.Body.Close()
		_ = notifResp.Body.Close()
		return response.Error(c, http.StatusBadRequest, err.Error())
	}

	defer func() {
		_ = cronResp.Body.Close()
		_ = notifResp.Body.Close()
		_ = recipeResp.Body.Close()
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
		{"cron.db", cronResp.Body},
		{"notifications.db", notifResp.Body},
		{"recipes.db", recipeResp.Body},
	}

	for _, f := range files {
		w, err := zipWriter.Create(f.name)
		if err != nil {
			return response.Error(c, http.StatusInternalServerError, err.Error())
		}

		_, err = io.Copy(w, f.body)
		if err != nil {
			return response.Error(c, http.StatusInternalServerError, err.Error())
		}
	}

	return nil
}
