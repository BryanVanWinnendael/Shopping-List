import { useEffect, useRef } from "react"
import { Alert } from "react-native"
import * as Network from "expo-network"

type NetworkIssue = "none" | "offline" | "slow"

export function useNetworkMonitor({ checkInterval = 5000, latencyThreshold = 1500 } = {}) {
    const checking = useRef(false)
    const currentIssue = useRef<NetworkIssue>("none")

    const showAlert = (title: string, message: string) => {
        Alert.alert(title, message)
    }

    const checkInternetSpeed = async (): Promise<boolean> => {
        const controller = new AbortController()

        const timeout = setTimeout(() => {
            controller.abort()
        }, latencyThreshold + 1000)

        const start = Date.now()

        try {
            await fetch("https://clients3.google.com/generate_204", {
                method: "GET",
                signal: controller.signal,
                cache: "no-store",
            })

            clearTimeout(timeout)

            const latency = Date.now() - start
            return latency > latencyThreshold
        } catch {
            clearTimeout(timeout)
            return true
        }
    }

    const checkNetwork = async () => {
        if (checking.current) return
        checking.current = true

        try {
            const networkState = await Network.getNetworkStateAsync()

            let issue: NetworkIssue = "none"

            if (!networkState.isConnected || !networkState.isInternetReachable) {
                issue = "offline"
            } else if (networkState.type === Network.NetworkStateType.WIFI) {
                const slow = await checkInternetSpeed()

                if (slow) {
                    issue = "slow"
                }
            }

            // Only alert when the issue changes.
            if (issue !== currentIssue.current) {
                currentIssue.current = issue

                switch (issue) {
                    case "offline":
                        showAlert("No Internet Connection", "Please check your network connection.")
                        break

                    case "slow":
                        showAlert("Slow Connection", "Your WiFi connection seems slow.")
                        break

                    case "none":
                        break
                }
            }
        } catch (error) {
            console.log("Network monitor:", error)
        } finally {
            checking.current = false
        }
    }

    useEffect(() => {
        checkNetwork()

        const interval = setInterval(checkNetwork, checkInterval)

        return () => clearInterval(interval)
    }, [checkInterval, latencyThreshold])
}
