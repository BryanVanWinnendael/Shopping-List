import { Accelerometer } from "expo-sensors"
import { useEffect, useRef } from "react"
import { AppState, AppStateStatus } from "react-native"

const SHAKE_THRESHOLD = 2.5
const SHAKE_COOLDOWN_MS = 1200
const RESUME_IGNORE_MS = 800 // ignore readings right after returning to the app

export function useShake(onShake: () => void) {
    const lastShake = useRef(0)
    const activeSince = useRef(AppState.currentState === "active" ? Date.now() : Infinity)

    // Keep the latest callback without resubscribing the sensor
    const onShakeRef = useRef(onShake)
    useEffect(() => {
        onShakeRef.current = onShake
    }, [onShake])

    useEffect(() => {
        let subscription: ReturnType<typeof Accelerometer.addListener> | null = null

        const start = () => {
            if (subscription) return

            Accelerometer.setUpdateInterval(100)

            subscription = Accelerometer.addListener(({ x, y, z }) => {
                // Safety net: never react unless the app is in the foreground
                if (AppState.currentState !== "active") return

                const now = Date.now()

                // Ignore stale/buffered readings right after resuming
                if (now - activeSince.current < RESUME_IGNORE_MS) return

                const acceleration = Math.sqrt(x * x + y * y + z * z)

                if (acceleration > SHAKE_THRESHOLD && now - lastShake.current > SHAKE_COOLDOWN_MS) {
                    lastShake.current = now
                    onShakeRef.current()
                }
            })
        }

        const stop = () => {
            subscription?.remove()
            subscription = null
        }

        const handleAppStateChange = (state: AppStateStatus) => {
            if (state === "active") {
                activeSince.current = Date.now()
                start()
            } else {
                activeSince.current = Infinity
                stop()
            }
        }

        if (AppState.currentState === "active") {
            start()
        }

        const appStateSub = AppState.addEventListener("change", handleAppStateChange)

        return () => {
            appStateSub.remove()
            stop()
        }
    }, [])
}
