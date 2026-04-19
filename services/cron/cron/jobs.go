package cron

import (
	"log"
	"shopping-list/cron/internal/config"
	"shopping-list/cron/services"
	"time"

	"github.com/robfig/cron/v3"
)

func StartCronJobs(cronService *services.CronService) *cron.Cron {
	c := cron.New()
	cronTime := config.Vars.CronTime

	_, err := c.AddFunc(cronTime, func() {
		if err := cronService.RunCronJob(); err != nil {
			log.Printf("cron job failed: %v", err)
		}

		now := time.Now().Unix()
		log.Println("Cron job ran at:", now)
	})

	if err != nil {
		log.Fatalf("failed to schedule cron job: %v", err)
	}

	c.Start()
	return c
}
