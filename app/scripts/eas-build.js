require("dotenv").config()

const fs = require("fs")
const { execSync } = require("child_process")
const path = require("path")

const ROOT = path.resolve(__dirname, "..")
const API_KEY_PATH = path.join(ROOT, "auth.p8")
const versionPath = path.join(ROOT, "version.json")

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

let version = { version: "1.0.0" }

// Load existing
if (fs.existsSync(versionPath)) {
  version = JSON.parse(fs.readFileSync(versionPath, "utf-8"))
}

// Increment version
const [major, minor, patch] = version.version.split(".").map(Number)
const newVersion = `${major}.${minor}.${patch + 1}`

version.version = newVersion

fs.writeFileSync(versionPath, JSON.stringify(version, null, 2))
console.log(`📦 Building iOS version ${newVersion}`)

// Build
try {
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
        EXPO_VERSION_NUMBER: newVersion,
      },
    },
  )
} catch (err) {
  console.error("❌ Build failed:", err.message)
  process.exit(1)
}
