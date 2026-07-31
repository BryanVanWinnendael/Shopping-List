# Shopping List - API Gateway

## Requirements

#### .env

```
LOGS_API_URL=http://shopping-list-logs:3000/api/logs
PRODUCTS_SEARCH_API_URL=http://shopping-list-products-search:3000/api/products
CATEGORY_MODEL_API_URL=http://shopping-list-category-model:3000/api
RECIPES_API_URL=http://shopping-list-recipes:3000/api/recipes
CRON_API_URL=http://shopping-list-cron:3000/api/cron
STORAGE_API_URL=http://shopping-list-storage:3000/api/storage
NOTIFICATIONS_API_URL="http://shopping-list-notifications:3000/api/notifications
API_TOKEN=***
PORT=3001
ADMIN_USER=test
ADMIN_PASS=***
```

\*\*\*\_API_URL:
Intended for local environments only. Base URL of the microservice within the Docker network. Defaults to given url if not specified.

API_TOKEN:
Generated API token.

PORT:
Intended for local environments only. Port to run microservice on. Defaults to given port if not specified.

ADMIN_USER:
Name of the user used for creating backups.

ADMIN_PASS:
Password of the user used for creating backups.

## Setup

### Run locally

For Unix:
```bash
air -c .air.unix.toml
```

For Windows:
```bash
air -c .air.windows.toml
```

### Build

```bash
docker compose up -d
```

## Creating backups
For creating backups for all data (db's, storage, csv's, ...), you can navigate to https://base_url/admin/backups. 