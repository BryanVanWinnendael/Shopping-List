require("dotenv").config()
const fs = require("fs")
const { execSync } = require("child_process")
const path = require("path")

const ROOT = path.resolve(__dirname, "..")
const API_KEY_PATH = path.join(ROOT, "auth.p8")

// Required environment variables
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

// Read current version from app.config.js
const appConfig = require(path.join(ROOT, "app.config.js")).default
const currentVersion = appConfig.expo.version

// Path to build.json
const buildPath = path.join(ROOT, "build.json")
let build = { ios: 0, version: currentVersion }

// Load previous build info if exists
if (fs.existsSync(buildPath)) {
  build = JSON.parse(fs.readFileSync(buildPath, "utf-8"))

  // Reset iOS build number if version changed
  if (build.version !== currentVersion) {
    console.log(
      `🔄 Version changed from ${build.version} → ${currentVersion}, resetting iOS build number to 0`,
    )
    build.ios = 0
    build.version = currentVersion
  }
}

// Increment iOS build number
build.ios += 1

// Save updated build info
fs.writeFileSync(buildPath, JSON.stringify(build, null, 2))

console.log(
  `📦 Building iOS version ${currentVersion}, build number ${build.ios}`,
)

// Run EAS build for iOS + auto-submit
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
        IOS_BUILD_NUMBER: String(build.ios),
      },
    },
  )
} catch (err) {
  console.error("❌ Build failed:", err.message)
  process.exit(1)
}
