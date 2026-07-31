# Shopping List - Category Model µS

## Requirements

#### .env

```
DATA_DIR=./data
CATEGORIES_FILE=categories.csv
MODEL_FILE=model.pkl
PORT=3000
LOGS_API_URL=http://shopping-list-logs:3000/api/logs
```

DATA_DIR:
Intended for local environments only. Directory used to store the generated data. Defaults to './data' if not specified.

CATEGORIES_FILE:
Intended for local environments only. File name used to store the categories. Defaults to 'categories.csv' if not specified.

MODEL_FILE:
Intended for local environments only. File name used to store the trained model. Defaults to 'model.pkl' if not specified.

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
