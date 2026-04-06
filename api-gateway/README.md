# Shopping List - API Gateway

## Requirements

#### .env

```
LOGS_API_URL=http://shopping-list-logs:3000/api/logs/shopping-list
PRODUCTS_SEARCH_API_URL=http://shopping-list-products-search:3000/api/products
CATEGORY_MODEL_API_URL=http://shopping-list-category-model:3000/api
RECIPES_API_URL=http://shopping-list-recipes:3000/api/recipes
CRON_API_URL=http://shopping-list-cron:3000/api/cron
STORAGE_API_URL=http://shopping-list-storage:3000/api/storage
NOTIFICATIONS_API_URL="http://shopping-list-notifications:3000/api/notifications
API_TOKEN=***
```

\*\*\*\_API_URL:
Base URL of the mircroservice within the Docker network. Can be left unchanged.

API_TOKEN:
Generated API token.

## Setup

Create a **Docker Network**

```bash
docker network create shopping-list-network
```

### Run locally

For unix:

```bash
air -c .air.unix.toml
```

For windows:

```bash
air -c .air.windows.toml
```

### Build

```bash
docker compose up -d
```
