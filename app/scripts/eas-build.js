require("dotenv").config()

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

const ROOT = path.resolve(__dirname, "..")
const CONFIG_PATH = path.join(ROOT, "app.config.js")
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

if (!fs.existsSync(API_KEY_PATH)) {
    console.error(`❌ Missing App Store Connect key: ${API_KEY_PATH}`)
    process.exit(1)
}

// Read config
let fileText = fs.readFileSync(CONFIG_PATH, "utf8")

// Current version
const versionMatch = fileText.match(
    /version:\s*["']([^"']+)["']/
)

if (!versionMatch) {
    console.error("❌ Could not find version")
    process.exit(1)
}

const version = versionMatch[1]

// Current build number
const buildMatch = fileText.match(
    /buildNumber:\s*["'](\d+)["']/
)

if (!buildMatch) {
    console.error("❌ Could not find buildNumber")
    process.exit(1)
}

const currentBuild = Number(buildMatch[1])
const easBuild = currentBuild + 1

// Update build number only
fileText = fileText.replace(
    /buildNumber:\s*["'](\d+)["']/,
    `buildNumber: "${easBuild}"`
)

fs.writeFileSync(CONFIG_PATH, fileText)

console.log(`✅ Version: ${version}`)
console.log(`✅ Build number: ${currentBuild} → ${easBuild}`)

// Build
try {
    console.log("🚀 Starting EAS build & submit...")

    execSync(
        "npx eas build -p ios --profile production --auto-submit --clear-cache --no-wait",
        {
            cwd: ROOT,
            stdio: "inherit",
            env: {
                ...process.env,
                EXPO_ASC_API_KEY_PATH: API_KEY_PATH,
            },
        }
    )
} catch (err) {
    console.error("❌ Build failed:", err.message)
    process.exit(1)
}