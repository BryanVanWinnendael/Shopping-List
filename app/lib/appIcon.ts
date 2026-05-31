import { IS_DEV } from "./constants"

type AppIconName = "new" | "old" | null

type SetAppIconFn = (name: AppIconName, isInBackground?: boolean) => string | false

let cachedSetAppIcon: SetAppIconFn | null = null

export async function setAppIconSafe(icon: AppIconName, isInBackground?: boolean) {
    if (IS_DEV) {
        return
    }

    try {
        if (!cachedSetAppIcon) {
            const mod = await import("@sefatunckanat/expo-dynamic-app-icon")
            cachedSetAppIcon = mod.setAppIcon
        }

        return cachedSetAppIcon?.(icon, isInBackground)
    } catch (err) {
        console.warn("setAppIcon failed:", err)
    }
}
