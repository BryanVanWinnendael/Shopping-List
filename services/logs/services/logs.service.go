package services

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"shopping-list/logs/internal/config"
	"shopping-list/shared/contracts"
	"shopping-list/shared/models"
	"strings"
	"sync"
	"time"
)

func NewLogsService() *LogsService {
	return &LogsService{}
}

type LogsService struct{}

var mu sync.Mutex

func (ls *LogsService) GetAppLogs() (*contracts.GetAppLogsResponse, error) {
	mu.Lock()
	defer mu.Unlock()

	logsPath := filepath.Join(config.Vars.DataDir, config.Vars.LogsFile)

	file, err := os.Open(logsPath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var logs contracts.GetAppLogsResponse

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		var log models.Log

		err := json.Unmarshal([]byte(scanner.Text()), &log)
		if err != nil {
			fmt.Println("failed to parse log:", err)
			continue
		}

		logs = append(logs, log)
	}

	return &logs, scanner.Err()
}

func (ls *LogsService) CreateAppLog(request *contracts.CreateAppLogRequest) (*contracts.CreateAppLogResponse, error) {
	mu.Lock()
	defer mu.Unlock()

	logsPath := filepath.Join(config.Vars.DataDir, config.Vars.LogsFile)

	file, err := os.OpenFile(logsPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	date := stringPtrTrimOrNil(request.Date)
	if date == nil {
		dateStr := time.Now().Format(time.RFC3339)
		date = &dateStr
	}

	log := models.Log{
		Date:   *date,
		Text:   request.Text,
		User:   request.User,
		Action: request.Action,
		Error:  request.Error,
	}

	jsonData, err := json.Marshal(log)
	if err != nil {
		return nil, err
	}

	_, err = file.WriteString(string(jsonData) + "\n")
	if err != nil {
		return nil, err
	}

	return &contracts.CreateAppLogResponse{
		Date:   *date,
		Text:   request.Text,
		User:   request.User,
		Action: request.Action,
		Error:  request.Error,
	}, nil
}

func (ls *LogsService) DeleteAppLogs() (*contracts.DeleteAppLogResponse, error) {
	mu.Lock()
	defer mu.Unlock()

	logsPath := filepath.Join(config.Vars.DataDir, config.Vars.LogsFile)

	err := os.WriteFile(logsPath, []byte(""), 0644)
	if err != nil {
		return nil, err
	}

	return &contracts.DeleteAppLogResponse{
		Message: "app logs deleted successfully",
	}, nil
}

func stringPtrTrimOrNil(s *string) *string {
	if s == nil {
		return nil
	}
	trimmed := strings.TrimSpace(*s)
	if trimmed == "" {
		return nil
	}
	return &trimmed
}
