# Shopping List - Notifications µS

## Requirements

#### .env

```
DATA_DIR=./data
BUCKET=notifications
DB=notifications.db
```

DATA_DIR:
Directory used to store the integrated database. Intended for development environments only. Defaults to './data' if not specified.

BUCKET:
Bucket used for the db. Intended for development environments only. Defaults to 'notifications' if not specified.

DB:
File name of the db. Intended for development environments only. Defaults to 'notifications.db' if not specified.

## Setup

Create a **Docker Network**

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
