export default {
  expo: {
    name: "Shopping List",
    slug: "shopping-list",
    scheme: "shopping-list-scheme",
    version: "2.1.5",
    orientation: "portrait",
    icon: "./assets/old-icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.bryanvw.shoppinglist",
      entitlements: {
        "aps-environment": "production",
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        CFBundleDisplayName: "Shopping List",
      },
      googleServicesFile: process.env.GOOGLE_SERVICES_PLIST,
      config: {
        usesNonExemptEncryption: false,
      },
      buildNumber: "2",
    },

    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.bryanvw.shoppinglist",
      permissions: ["android.permission.RECORD_AUDIO"],
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
    },

    web: {
      favicon: "./assets/icon.png",
      bundler: "metro",
    },

    plugins: [
      "expo-router",
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos.",
        },
      ],
      [
        "expo-document-picker",
        {
          iCloudContainerEnvironment: "Production",
        },
      ],
      "@react-native-firebase/app",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
            buildReactNativeFromSource: true,
          },
        },
      ],
      [
        "@sefatunckanat/expo-dynamic-app-icon",
        {
          new: {
            ios: "./assets/new-icon.png",
          },
          old: {
            ios: "./assets/old-icon.png",
          },
        },
      ],
    ],

    extra: {
      router: {},
      eas: {
        projectId: "06fcfc72-3dba-4eaa-baed-ab078d5ddbd9",
      },
    },
  },
}
