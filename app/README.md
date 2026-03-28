# Shopping List - App

## Requirements

### Apple

Generate a p8 file.
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
App Store Connect → Users and Access → Integrations -> +Active -> create -> key id

EXPO_ASC_ISSUER_ID:
App Store Connect → Users and Access -> integrations -> issuer id

EXPO_APPLE_TEAM_ID:
https://developer.apple.com/account#MembershipDetailsCard

EXPO_APPLE_TEAM_TYPE:
Usually COMPANY or INDIVIDUAL

EXPO_APPLE_ID:
Your Apple developer email

### Firebase

Generate the google-services.json and GoogleService-Info.plist files for your project.

#### .env

Firebase Console → Project Settings → General → Your Apps
and copy values for:

```
API_KEY_DEV=***
AUTH_DOMAIN_DEV=***
PROJECT_ID_DEV=***
STORAGE_BUCKET_DEV=***
MESSAGING_SENDER_ID_DEV=***
APP_ID_DEV=***
DATABASE_URL_DEV=***
```

## Commands

```bash
eas build -p ios --auto-submit
```

```bash
eas build -p ios --profile production --auto-submit
```

```bash
npx expo start --no-dev --minify
```
