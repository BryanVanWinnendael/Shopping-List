#!/usr/bin/env bash

set -e

folders=(
  "category-model"
  "cron"
  "logs"
  "notifications"
  "products-search"
  "recipes"
  "storage"
)

failed=0

for folder in "${folders[@]}"; do
  echo
  echo "=========================================="
  echo "Checking $folder"
  echo "=========================================="

  cd "$folder"

  # Handlers
  if [ -d "handlers" ]; then
    go test ./handlers -coverprofile=handlers.out >/dev/null 2>&1

    handlersCoverage=$(go tool cover -func=handlers.out | grep total: | awk '{print $3}')
    handlersInt=${handlersCoverage%\%}
    handlersInt=${handlersInt%%.*}

    echo "Handlers: $handlersCoverage"

    if [ "$handlersInt" -lt 80 ]; then
      echo "[FAIL] handlers coverage below 80%"
      failed=1
    else
      echo "[PASS] handlers coverage"
    fi

    rm -f handlers.out
  else
    echo "Handlers folder not found"
  fi

  # Services
  if [ -d "services" ]; then
    go test ./services -coverprofile=services.out >/dev/null 2>&1

    servicesCoverage=$(go tool cover -func=services.out | grep total: | awk '{print $3}')
    servicesInt=${servicesCoverage%\%}
    servicesInt=${servicesInt%%.*}

    echo "Services: $servicesCoverage"

    if [ "$servicesInt" -lt 80 ]; then
      echo "[FAIL] services coverage below 80%"
      failed=1
    else
      echo "[PASS] services coverage"
    fi

    rm -f services.out
  else
    echo "Services folder not found"
  fi

  cd ..
done

echo
echo "=========================================="

if [ "$failed" -eq 1 ]; then
  echo "COVERAGE CHECK FAILED"
  exit 1
else
  echo "ALL COVERAGE CHECKS PASSED"
  exit 0
fi