package constants

import (
	"fmt"
	"shopping-list/logs/internal/config"
)

var LogFile = fmt.Sprintf("%s/logs.file", config.Vars.DataDir)
