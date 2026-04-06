# Shopping List - Storage µS

## Requirements

#### .env

```
STORAGE_DIR=./storage
API_TOKEN=***
HOST=***
```

STORAGE_DIR:
Directory used to store images. Intended for development environments only. Defaults to ./storage if not specified.

API_TOKEN:
The same key used in your API Gateway.

HOST:
Base URL or IP address of this microservice. This is used to provide public access to stored images.

## Setup

Create a **Docker Network**

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
