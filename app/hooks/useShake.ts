import { Accelerometer } from "expo-sensors"
import { useEffect, useRef } from "react"

export function useShake(onShake: () => void) {
    const lastShake = useRef(0)

    useEffect(() => {
        Accelerometer.setUpdateInterval(100)

        const subscription = Accelerometer.addListener(({ x, y, z }) => {
            const acceleration = Math.sqrt(x * x + y * y + z * z)

            const now = Date.now()

            if (acceleration > 2.5 && now - lastShake.current > 1200) {
                lastShake.current = now
                onShake()
            }
        })

        return () => subscription.remove()
    }, [onShake])
}
