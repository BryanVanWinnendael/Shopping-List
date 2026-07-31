# Shopping List - Recipes µS

## Requirements

#### .env

```
DATA_DIR=./data
BUCKET=recipes
DB=recipes.db
ONLINE_RECIPES_API_URL=https://recipes.com
PORT=3000
LOGS_API_URL=http://shopping-list-logs:3000/api/logs
```

DATA_DIR:
Intended for local environments only. Directory used to store the generated data. Defaults to ./data if not specified.

BUCKET:
Intended for local environments only. Bucket used for the db. Defaults to 'recipes' if not specified.

DB:
Intended for local environments only. File name of the db.  Defaults to 'recipes.db' if not specified.

ONLINE_RECIPES_API_URL:
URL used for fetching recipes. Code applied for https://15gram.be/recepten.

PORT:
Intended for local environments only. Port to run microservice on. Defaults to given port if not specified.

LOGS_API_URL:
Intended for local environments only. Base URL of the logs microservice within the Docker network. Defaults to given url if not specified.

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
