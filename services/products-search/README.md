# Shopping List - Products Search µS

## Requirements

#### .env

```
DATA_DIR=./data
PRODUCTS_FILE=products.csv
```

DATA_DIR:
Directory used to store the csv of products. Intended for development environments only. Defaults to ./data if not specified.

PRODUCTS_FILE:
File name of the products csv. Intended for development environments only. Defaults to 'products.csv' if not specified.

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
