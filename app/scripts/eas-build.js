require("dotenv").config()

const { execSync } = require("child_process")
const path = require("path")
const appConfig = require("../app.config.js")

const ROOT = path.resolve(__dirname, "..")
const API_KEY_PATH = path.join(ROOT, "auth.p8")

const required = [
  "EXPO_ASC_KEY_ID",
  "EXPO_ASC_ISSUER_ID",
  "EXPO_APPLE_TEAM_ID",
  "EXPO_APPLE_TEAM_TYPE",
  "EXPO_APPLE_ID",
]

for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`)
    process.exit(1)
  }
}

const current = parseInt(appConfig.default.expo.ios.buildNumber || "1", 10)
const next = current + 1
appConfig.expo.ios.buildNumber = String(next)

//  Run EAS build for ios + submit
try {
  console.log("🚀 Starting EAS iOS build & submit...")
  execSync(
    "eas build -p ios --profile production --auto-submit --clear-cache",
    {
      stdio: "inherit",
      cwd: ROOT,
      env: {
        ...process.env,
        EXPO_ASC_API_KEY_PATH: API_KEY_PATH,
        EXPO_ASC_KEY_ID: process.env.EXPO_ASC_KEY_ID,
        EXPO_ASC_ISSUER_ID: process.env.EXPO_ASC_ISSUER_ID,
        EXPO_APPLE_TEAM_ID: process.env.EXPO_APPLE_TEAM_ID,
        EXPO_APPLE_TEAM_TYPE: process.env.EXPO_APPLE_TEAM_TYPE,
        EXPO_APPLE_ID: process.env.EXPO_APPLE_ID,
      },
    },
  )
} catch (err) {
  console.error("❌ Build failed:", err.message)
  process.exit(1)
}
