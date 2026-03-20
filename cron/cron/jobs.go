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

	c.AddFunc(cronTime, func() {
		cronService.RunCronJob()
		now := time.Now().Unix()

		log.Println("Cron job ran at:", now)
	})

	c.Start()
	return c
}
