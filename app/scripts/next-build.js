const fs = require("fs")
const path = require("path")

const ROOT = path.resolve(__dirname, "..")
const CONFIG_PATH = path.resolve(ROOT, "app.config.js")

let fileText = fs.readFileSync(CONFIG_PATH, "utf-8")

const buildNumberRegex = /buildNumber:\s*["'](\d+)["']/

const match = fileText.match(buildNumberRegex)
if (!match) {
  console.error("❌ Could not find ios.buildNumber in app.config.js")
  process.exit(1)
}

const currentBuild = parseInt(match[1], 10)
const newBuild = currentBuild + 1

fileText = fileText.replace(buildNumberRegex, `buildNumber: "${newBuild}"`)

fs.writeFileSync(CONFIG_PATH, fileText)

console.log(`✅ Updated iOS buildNumber to ${newBuild}`)
