# Shopping List - Services

## Setup

For PROD and using docker locally first create a network:
```bash
docker network create shopping-list-network
```

## Run all services locally 

For Windows:
```bash
./run-air.bat
```

For Unix:
```bash
./run-air.sh
```

## Check services coverage

To check if all services have at least a test coverage of 80%, run:

For Windows:
```bash
./check-coverage.bat
```

For Unix:
```bash
./check-coverage.sh
```

## Creating backups
For creating backups for all data (db's, storage, csv's, ...), you can navigate to https://base_url/admin/backups. 