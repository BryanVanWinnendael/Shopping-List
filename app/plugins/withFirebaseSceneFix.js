const { withAppDelegate } = require("expo/config-plugins")

// Expo SDK 58 starts React Native from a SceneDelegate, so the AppDelegate no
// longer contains the `self.moduleName` / `factory.startReactNative(` lines that
// @react-native-firebase/app 22.x looks for. Its plugin warns and skips, leaving
// native Firebase unconfigured and every database/auth call failing.
//
// This plugin runs after the Firebase one and inserts FirebaseApp.configure()
// itself. Delete it once react-native-firebase 27+ (which fixed this upstream)
// is installed.

const ANCHOR = "return super.application(application, didFinishLaunchingWithOptions: launchOptions)"

module.exports = function withFirebaseSceneFix(config) {
    return withAppDelegate(config, (config) => {
        if (config.modResults.language !== "swift") {
            throw new Error("withFirebaseSceneFix expects the Swift AppDelegate from Expo SDK 58.")
        }

        let contents = config.modResults.contents

        // Already configured, either by a newer Firebase plugin or a previous run.
        if (contents.includes("FirebaseApp.configure()")) {
            return config
        }

        if (!contents.includes("import FirebaseCore")) {
            contents = contents.replace(/^(internal import Expo|import Expo)$/m, "$1\nimport FirebaseCore")
        }

        if (!contents.includes(ANCHOR)) {
            throw new Error("withFirebaseSceneFix: scene-lifecycle return not found in AppDelegate.swift.")
        }

        config.modResults.contents = contents.replace(ANCHOR, `FirebaseApp.configure()\n\n    ${ANCHOR}`)

        return config
    })
}
