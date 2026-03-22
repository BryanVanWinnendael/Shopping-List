package constants

import (
	"fmt"
	"shopping-list/products-search/internal/config"
)

var ProductsCSV = fmt.Sprintf("%s/products.csv", config.Vars.DataDir)
