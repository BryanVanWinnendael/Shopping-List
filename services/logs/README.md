# Shopping List - Logs µS

## Requirements

#### .env

```
DATA_DIR=./data
LOGS_FILE=logs.txt
PORT=3000
```

DATA_DIR:
Intended for local environments only. Directory used to store the generated data. Defaults to './data' if not specified.

LOGS_FILE:
Intended for local environments only. File name of the stored logs. Defaults to 'logs.txt' if not specified.

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
