package constants

import (
	"path/filepath"
	"shopping-list/logs/internal/config"
)

func LogsFile() string {
	return filepath.Join(config.Vars.DataDir, "logs.txt")
}
