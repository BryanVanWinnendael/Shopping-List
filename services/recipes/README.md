# Shopping List - Recipes µS

## Requirements

#### .env

```
DATA_DIR=./data
BUCKET=recipes
DB=recipes.db
```

DATA_DIR:
Directory used to store the integrated database. Intended for development environments only. Defaults to ./data if not specified.

BUCKET:
Bucket used for the db. Intended for development environments only. Defaults to 'recipes' if not specified.

DB:
File name of the db. Intended for development environments only. Defaults to 'recipes.db' if not specified.

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
