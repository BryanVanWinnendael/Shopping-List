# Shopping List - Cron µS

## Requirements

#### .env

```
DATA_DIR=./data
BUCKET=cron
DB=cron.db
FIREBASE_URL=***
NOTIFICATIONS_API_URL=http://shopping-list-notifications:3000/api/notifications
CRON_TIME="0 0 * * 5"
GOOGLE_APPLICATION_CREDENTIALS=***
PORT=3000
LOGS_API_URL=http://shopping-list-logs:3000/api/logs
```

DATA_DIR:
Intended for local environments only. Directory used to store the generated data. Defaults to './data' if not specified.

BUCKET:
Intended for local environments only. Bucket used for the db. Defaults to 'cron' if not specified.

DB:
Intended for local environments only. File name of the db. Defaults to 'cron.db' if not specified.

FIREBASE_URL:
Firebase Console → Project Settings → General → Your Apps
and copy value.

NOTIFICATIONS_API_URL:
Intended for local environments only. Base URL of the Notifications microservice within the Docker network. Defaults to given url if not specified.

CRON_TIME:
Cron expression that determines when weekly items are added to the list.

GOOGLE_APPLICATION_CREDENTIALS:
Path of the serviceAccountKey.json. Can be found at:
Firebase Console → Project Settings → Service accounts → Firebase Admin SDK → Generate new private key.

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
