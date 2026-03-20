// Only used for local development on expo go
import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"
import { getStorage } from "firebase/storage"
import {
  API_KEY_DEV,
  AUTH_DOMAIN_DEV,
  PROJECT_ID_DEV,
  STORAGE_BUCKET_DEV,
  MESSAGING_SENDER_ID_DEV,
  APP_ID_DEV,
  DATABASE_URL_DEV,
} from "@env"

const firebaseConfig = {
  apiKey: API_KEY_DEV,
  authDomain: AUTH_DOMAIN_DEV,
  projectId: PROJECT_ID_DEV,
  storageBucket: STORAGE_BUCKET_DEV,
  messagingSenderId: MESSAGING_SENDER_ID_DEV,
  appId: APP_ID_DEV,
  databaseURL: DATABASE_URL_DEV,
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
export const storage = getStorage(app)
