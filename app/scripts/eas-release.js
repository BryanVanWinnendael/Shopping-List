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

// Parse version argument
const versionArg = process.argv.find((arg) => arg.startsWith("--v="))
const version = versionArg?.split("=")[1]

if (!version) {
    console.error("❌ Missing version. Use: yarn build --v=2.2.0")
    process.exit(1)
}

// Validate version format
if (!/^\d+\.\d+\.\d+$/.test(version)) {
    console.error("❌ Invalid version. Expected format: x.y.z")
    process.exit(1)
}

// Read app.config.js
let fileText = fs.readFileSync(CONFIG_PATH, "utf8")

// Update version
const versionRegex = /version:\s*["']([^"']+)["']/

if (!versionRegex.test(fileText)) {
    console.error("❌ Could not find version in app.config.js")
    process.exit(1)
}

fileText = fileText.replace(
    versionRegex,
    `version: "${version}"`
)

fs.writeFileSync(CONFIG_PATH, fileText)

console.log(`✅ Updated version to ${version}`)
console.log(`📦 Building version ${version}`)

// Run EAS build
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
        }
    )
} catch (err) {
    console.error("❌ Build failed:", err.message)
    process.exit(1)
}