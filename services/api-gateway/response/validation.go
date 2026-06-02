package response

import (
	"fmt"
	"reflect"
	"strings"

	"github.com/labstack/echo/v4"
)

func GetMissingRequestFields(body interface{}) []string {
	return getMissing(reflect.ValueOf(body), "")
}

func getMissing(val reflect.Value, prefix string) []string {
	var missing []string

	if val.Kind() == reflect.Pointer {
		if val.IsNil() {
			return missing
		}
		val = val.Elem()
	}

	if val.Kind() != reflect.Struct {
		return missing
	}

	typ := val.Type()

	for i := 0; i < val.NumField(); i++ {
		field := val.Field(i)
		fieldType := typ.Field(i)

		validateTag := fieldType.Tag.Get("validate")
		jsonTag := fieldType.Tag.Get("json")
		if jsonTag == "" {
			jsonTag = fieldType.Name
		} else {
			jsonTag = strings.Split(jsonTag, ",")[0]
		}

		fullName := jsonTag
		if prefix != "" {
			fullName = prefix + "." + jsonTag
		}

		if validateTag == "required" {
			switch field.Kind() {
			case reflect.String:
				if strings.TrimSpace(field.String()) == "" {
					missing = append(missing, fullName)
				}
			case reflect.Pointer:
				if field.IsNil() {
					missing = append(missing, fullName)
				}
			}
		}

		if field.Kind() == reflect.Slice {
			for j := 0; j < field.Len(); j++ {
				item := field.Index(j)
				childPrefix := fmt.Sprintf("%s[%d]", fullName, j)
				missing = append(missing, getMissing(item, childPrefix)...)
			}
		}

		if field.Kind() == reflect.Struct {
			missing = append(missing, getMissing(field, fullName)...)
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
