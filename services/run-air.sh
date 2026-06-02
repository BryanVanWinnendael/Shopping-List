#!/bin/bash

folders=(
  api-gateway
  category-model
  cron
  logs
  notifications
  products-search
  recipes
  storage
)

for folder in "${folders[@]}"; do
  echo "Starting $folder..."
  (
    cd "$folder" || exit
    air -c .air.unix.toml
  ) &
done

echo "All services started in this terminal."

wait