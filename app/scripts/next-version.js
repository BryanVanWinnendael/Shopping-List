const fs = require("fs")
const path = require("path")

const ROOT = path.resolve(__dirname, "..")
const CONFIG_PATH = path.resolve(ROOT, "app.config.js")

let fileText = fs.readFileSync(CONFIG_PATH, "utf-8")

const versionRegex = /version:\s*["'](\d+)\.(\d+)\.(\d+)["']/
const versionMatch = fileText.match(versionRegex)

if (!versionMatch) {
  console.error("❌ Could not find version in app.config.js")
  process.exit(1)
}

const [_, major, minor, patch] = versionMatch.map(Number)
const newVersion = `${major}.${minor}.${patch + 1}`

fileText = fileText.replace(versionRegex, `version: "${newVersion}"`)

const buildNumberRegex = /buildNumber:\s*["'](\d+)["']/

if (!fileText.match(buildNumberRegex)) {
  console.error("❌ Could not find ios.buildNumber in app.config.js")
  process.exit(1)
}

fileText = fileText.replace(buildNumberRegex, `buildNumber: "1"`)

fs.writeFileSync(CONFIG_PATH, fileText)

console.log(`✅ Version bumped to ${newVersion}`)
console.log(`🔄 iOS buildNumber reset to 1`)
