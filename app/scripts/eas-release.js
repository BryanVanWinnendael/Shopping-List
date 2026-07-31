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

// Parse arguments
const versionArg = process.argv.find((arg) => arg.startsWith("--v="))
const buildNumberArg = process.argv.find((arg) => arg.startsWith("--build="))

const versionInput = versionArg?.split("=")[1]
const buildNumberInput = buildNumberArg?.split("=")[1]

if (!versionInput && !buildNumberInput) {
    console.error(
        "❌ Missing version or build number. Use: yarn build --v=2.5.0 [--build=3]"
    )
    process.exit(1)
}

if (versionInput && !/^\d+\.\d+\.\d+$/.test(versionInput)) {
    console.error("❌ Invalid version. Expected format: x.y.z")
    process.exit(1)
}

if (buildNumberInput && !/^\d+$/.test(buildNumberInput)) {
    console.error("❌ Invalid build number. Expected integer")
    process.exit(1)
}

// Read app.config.js
let fileText = fs.readFileSync(CONFIG_PATH, "utf8")


// Extract current version
const currentVersionMatch = fileText.match(
    /version:\s*["']([^"']+)["']/
)

if (!currentVersionMatch) {
    console.error("❌ Could not find version in app.config.js")
    process.exit(1)
}

const currentVersion = currentVersionMatch[1]

// Extract current build number
const currentBuildMatch = fileText.match(
    /buildNumber:\s*["'](\d+)["']/
)

if (!currentBuildMatch) {
    console.error("❌ Could not find ios buildNumber in app.config.js")
    process.exit(1)
}

const currentBuildNumber = Number(currentBuildMatch[1])

let newVersion = currentVersion
let newBuildNumber = currentBuildNumber

// Version supplied
if (versionInput) {

    newVersion = versionInput

    if (versionInput !== currentVersion) {
        // New version -> reset build number
        newBuildNumber = 0
    } else {
        // Same version -> increment
        newBuildNumber = currentBuildNumber + 1
    }
}

// Build number supplied
if (buildNumberInput) {
    newBuildNumber = Number(buildNumberInput)
}

// Replace version
fileText = fileText.replace(
    /version:\s*["']([^"']+)["']/,
    `version: "${newVersion}"`
)

// Replace build number
fileText = fileText.replace(
    /buildNumber:\s*["'](\d+)["']/,
    `buildNumber: "${newBuildNumber}"`
)

fs.writeFileSync(CONFIG_PATH, fileText)

console.log(`✅ Version: ${newVersion}`)
console.log(`✅ iOS build number: ${newBuildNumber}`)

// Run EAS build
try {
    console.log("🚀 Starting EAS iOS build & submit...")

    execSync(
        "npx eas build -p ios --profile production --auto-submit --clear-cache --no-wait",
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