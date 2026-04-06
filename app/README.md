# Shopping List - App

## Requirements

### Apple

Generate a p8 file and place this in the root.
https://developer.apple.com/help/account/keys/create-a-private-key/

#### .env

```
EXPO_ASC_KEY_ID=***
EXPO_ASC_ISSUER_ID=***
EXPO_APPLE_TEAM_ID=***
EXPO_APPLE_TEAM_TYPE=***
EXPO_APPLE_ID=***
```

EXPO_ASC_KEY_ID:
App Store Connect → Users and Access → Integrations -> +Active -> Create -> Key ID

EXPO_ASC_ISSUER_ID:
App Store Connect → Users and Access -> Integrations -> Issuer ID

EXPO_APPLE_TEAM_ID:
https://developer.apple.com/account#MembershipDetailsCard

EXPO_APPLE_TEAM_TYPE:
Usually COMPANY or INDIVIDUAL

EXPO_APPLE_ID:
Your Apple developer email

### Firebase

Generate the google-services.json and GoogleService-Info.plist files for your project.
Place these in the root and upload these to expo.dev Environment variables as GOOGLE_SERVICES_PLIST and GOOGLE_SERVICES_JSON.

Enable Realtime Database and Authentication in the Project Overview.
For Authentication you will only need to enable Authentication sign-in method.

#### .env

Firebase Console → Project Settings → General → Your Apps
and copy values for:
expo

```
API_KEY_DEV=***
AUTH_DOMAIN_DEV=***
PROJECT_ID_DEV=***
STORAGE_BUCKET_DEV=***
MESSAGING_SENDER_ID_DEV=***
APP_ID_DEV=***
DATABASE_URL_DEV=***
```

### Others

#### .env

```
API_GATEWAY=***
API_KEY=***

USERS=["Test"]

ADMIN_USERS=["Test"]
```

API_GATEWAY:
The url/IP pointing to your API Gateway.

API_KEY:
The same key used in your API Gateway.

USERS:
All users that use the app.

ADMIN_USERS:
Admin users that can access private views.

## Commands

```bash
yarn install
```

Install all packages

```bash
yarn start
```

Run locally (same WiFi). Open with Expo Go or simulator.

```bash
yarn tunnel
```

Run via tunnel (different network). Works anywhere.

## Creating a Release or Build

When CI/CD is setup, you can create a new release/build when changing the version or build number in the **app.config.js**.
