# Shopping List - Logs µS

## Requirements

#### .env

```
DATA_DIR=./data
```

DATA_DIR:
Directory used to store the logs file. Intended for development environments only. Defaults to ./data if not specified.

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
