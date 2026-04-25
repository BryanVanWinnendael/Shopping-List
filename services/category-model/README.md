# Shopping List - Category Model µS

## Requirements

#### .env

```
DATA_DIR=./data
CATEGORIES_FILE=categories.csv
MODEL_FILE=model.pkl
```

DATA_DIR:
Directory used to store the csv of categories and the trained model. Intended for development environments only. Defaults to './data' if not specified.

CATEGORIES_FILE:
File name used to store the categories. Intended for development environments only. Defaults to 'categories.csv' if not specified.

MODEL_FILE:
File name used to store the trained model. Intended for development environments only. Defaults to 'model.pkl' if not specified.
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
