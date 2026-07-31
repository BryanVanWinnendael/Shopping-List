# Shopping List - Storage µS

## Requirements

#### .env

```
STORAGE_DIR=./storage
API_TOKEN=***
HOST=https://example.com/storage
PORT=3000
LOGS_API_URL=http://shopping-list-logs:3000/api/logs
```

STORAGE_DIR:
Intended for local environments only. Directory used to store the generated data. Defaults to ./storage if not specified.

API_TOKEN:
The same key used in your API Gateway.

HOST:
Base URL or IP address of this microservice. This is used to provide public access to stored images. Should end with '/storage'.

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
