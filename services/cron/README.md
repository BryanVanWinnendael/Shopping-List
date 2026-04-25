# Shopping List - Cron µS

## Requirements

#### .env

```
DATA_DIR=./data
BUCKET=cron
DB=cron.db
FIREBASE_URL=***
NOTIFICATIONS_API=http://shopping-list-notifications:3000/api/notifications
CRON_TIME="0 0 * * 5"
GOOGLE_APPLICATION_CREDENTIALS=***
```

DATA_DIR:
Directory used to store the integrated database. Intended for development environments only. Defaults to './data' if not specified.

BUCKET:
Bucket used for the db. Intended for development environments only. Defaults to 'cron' if not specified.

DB:
File name of the db. Intended for development environments only. Defaults to 'cron.db' if not specified.

FIREBASE_URL:
Firebase Console → Project Settings → General → Your Apps
and copy value.

NOTIFICATIONS_API:
Base URL of the Notifications microservice within the Docker network. Can be left unchanged.

CRON_TIME:
Cron expression that determines when weekly items are added to the list.

GOOGLE_APPLICATION_CREDENTIALS:
Path of the serviceAccountKey.json. Can be found at:
Firebase Console → Project Settings → Service accounts → Firebase Admin SDK → Generate new private key

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
