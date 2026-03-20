package response

import (
	"reflect"
	"strings"

	"github.com/labstack/echo/v4"
)

func GetMissingRequestFields(body interface{}) []string {
	var missing []string

	val := reflect.ValueOf(body)
	if val.Kind() == reflect.Ptr {
		val = val.Elem()
	}

	typ := val.Type()

	for i := 0; i < val.NumField(); i++ {
		field := val.Field(i)
		fieldType := typ.Field(i)

		switch field.Kind() {
		case reflect.String:
			if strings.TrimSpace(field.String()) == "" {
				jsonTag := fieldType.Tag.Get("json")
				if jsonTag == "" {
					jsonTag = fieldType.Name
				} else {
					jsonTag = strings.Split(jsonTag, ",")[0]
				}
				missing = append(missing, jsonTag)
			}
		case reflect.Pointer:
			if field.IsNil() {
				jsonTag := fieldType.Tag.Get("json")
				if jsonTag == "" {
					jsonTag = fieldType.Name
				} else {
					jsonTag = strings.Split(jsonTag, ",")[0]
				}
				missing = append(missing, jsonTag)
			}
		}
	}

	return missing
}

func GetMissingQueryParams(c echo.Context, paramNames ...string) []string {
	var missing []string
	for _, name := range paramNames {
		val := strings.TrimSpace(c.QueryParam(name))
		if val == "" {
			missing = append(missing, name)
		}
	}
	return missing
}

func GetMissingPathParams(c echo.Context, paramNames ...string) []string {
	var missing []string
	for _, name := range paramNames {
		val := strings.TrimSpace(c.Param(name))
		if val == "" {
			missing = append(missing, name)
		}
	}
	return missing
}
