# Shopping List - Logs µS

## Requirements

#### .env

```
DATA_DIR=./data
LOGS_FILE=logs.txt
```

DATA_DIR:
Directory used to store the logs file. Intended for development environments only. Defaults to ./data if not specified.

LOGS_FILE:
File name of the logs. Intended for development environments only. Defaults to 'logs.txt' if not specified.

## Setup

Create a **Docker Network**

### Run locally

For Unix:

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
