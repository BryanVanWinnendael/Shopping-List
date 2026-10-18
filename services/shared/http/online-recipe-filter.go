package http

import (
	"net/url"
	"shopping-list/shared/models"
	"strings"

	"github.com/labstack/echo/v4"
)

// ReadOnlineRecipeFilter reads the repeated 15gram filter params from a query
// string. Both the bracketed form (kitchen[]=x) and the plain form (kitchen=x)
// are accepted, so callers may use whichever their HTTP client produces.
func ReadOnlineRecipeFilter(c echo.Context) models.OnlineRecipeFilter {
	params := c.QueryParams()

	return models.OnlineRecipeFilter{
		Kitchens: append(params["kitchen[]"], params["kitchen"]...),
		Courses:  append(params["course[]"], params["course"]...),
		Dishes:   append(params["dish[]"], params["dish"]...),
		Specials: append(params["special[]"], params["special"]...),
	}
}

// AddOnlineRecipeFilter writes the filter onto 15gram's bracketed param format,
// one entry per selected value. Blank values are dropped.
func AddOnlineRecipeFilter(params url.Values, filter models.OnlineRecipeFilter) {
	for _, group := range []struct {
		key    string
		values []string
	}{
		{"kitchen[]", filter.Kitchens},
		{"course[]", filter.Courses},
		{"dish[]", filter.Dishes},
		{"special[]", filter.Specials},
	} {
		for _, value := range group.values {
			if trimmed := strings.TrimSpace(value); trimmed != "" {
				params.Add(group.key, trimmed)
			}
		}
	}
}
