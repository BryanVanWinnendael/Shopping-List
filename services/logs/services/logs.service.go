package services

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"shopping-list/logs/internal/config"
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

	logsPath := filepath.Join(config.Vars.DataDir, config.Vars.LogsFile)
	file, err := os.Open(logsPath)
	if err != nil {
		return nil, err
	}
	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			fmt.Println("Failed to close file:", err)
		}
	}(file)

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

	logsPath := filepath.Join(config.Vars.DataDir, config.Vars.LogsFile)
	file, err := os.OpenFile(logsPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer func(file *os.File) {
		err := file.Close()
		if err != nil {
			fmt.Println("Failed to close file:", err)
		}
	}(file)

	_, err = file.WriteString(text + "\n")
	return err
}

func (ls *LogsService) ClearLogs() error {
	mu.Lock()
	defer mu.Unlock()

	logsPath := filepath.Join(config.Vars.DataDir, config.Vars.LogsFile)
	return os.WriteFile(logsPath, []byte(""), 0644)
}
