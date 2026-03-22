package services

import (
	"bufio"
	"os"
	"path/filepath"
	"shopping-list/logs/internal/config"
	"shopping-list/logs/internal/constants"

	"sync"
)

func NewLogsService() *LogsService {
	return &LogsService{}
}

type LogsService struct{}

var mu sync.Mutex

func (ls *LogsService) GetLogs() ([]string, error) {
	mu.Lock()
	defer mu.Unlock()

	logFile := filepath.Join(config.Vars.DataDir, constants.LogFile)
	file, err := os.Open(logFile)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var logs []string
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		logs = append(logs, scanner.Text())
	}

	return logs, scanner.Err()
}

func (ls *LogsService) WriteLog(text string) error {
	mu.Lock()
	defer mu.Unlock()

	logFile := filepath.Join(config.Vars.DataDir, constants.LogFile)
	file, err := os.OpenFile(logFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.WriteString(text + "\n")
	return err
}

func (ls *LogsService) ClearLogs() error {
	mu.Lock()
	defer mu.Unlock()

	logFile := filepath.Join(config.Vars.DataDir, constants.LogFile)
	return os.WriteFile(logFile, []byte(""), 0644)
}
