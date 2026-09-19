import { useEffect, useRef } from "react"
import { Alert, AppState } from "react-native"
import * as Network from "expo-network"

type NetworkIssue = "none" | "offline" | "slow"

type Options = {
    checkInterval?: number
    latencyThreshold?: number
}

export function useNetworkMonitor({ checkInterval = 5000, latencyThreshold = 1500 }: Options = {}) {
    const currentIssue = useRef<NetworkIssue>("none")

    useEffect(() => {
        let checking = false
        let interval: ReturnType<typeof setInterval> | undefined
        let resumeTimeout: ReturnType<typeof setTimeout> | undefined
        let speedCheckController: AbortController | undefined
        let isMounted = true

        const showAlert = (title: string, message: string) => {
            Alert.alert(title, message)
        }

        const stopPolling = () => {
            if (interval) {
                clearInterval(interval)
                interval = undefined
            }

            if (resumeTimeout) {
                clearTimeout(resumeTimeout)
                resumeTimeout = undefined
            }

            speedCheckController?.abort()
            speedCheckController = undefined
        }

        const checkInternetSpeed = async (): Promise<boolean | null> => {
            const controller = new AbortController()
            speedCheckController = controller

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

                const latency = Date.now() - start

                return latency > latencyThreshold
            } catch {
                // A background transition intentionally aborts this request.
                // Do not turn that into a false “slow connection” warning.
                if (controller.signal.aborted || AppState.currentState !== "active") {
                    return null
                }

                return true
            } finally {
                clearTimeout(timeout)

                if (speedCheckController === controller) {
                    speedCheckController = undefined
                }
            }
        }

        const checkNetwork = async () => {
            if (checking || !isMounted || AppState.currentState !== "active") {
                return
            }

            checking = true

            try {
                const networkState = await Network.getNetworkStateAsync()

                if (!isMounted || AppState.currentState !== "active") {
                    return
                }

                let issue: NetworkIssue = "none"

                // Only treat explicit false values as offline.
                // `undefined` means the platform has not provided that value.
                if (networkState.isConnected === false || networkState.isInternetReachable === false) {
                    issue = "offline"
                } else if (networkState.type === Network.NetworkStateType.WIFI) {
                    const slow = await checkInternetSpeed()

                    if (!isMounted || AppState.currentState !== "active" || slow === null) {
                        return
                    }

                    if (slow) {
                        issue = "slow"
                    }
                }

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
                if (AppState.currentState === "active") {
                    console.log("Network monitor:", error)
                }
            } finally {
                checking = false
            }
        }

        const startPolling = (delay = 0) => {
            stopPolling()

            resumeTimeout = setTimeout(() => {
                if (!isMounted || AppState.currentState !== "active") {
                    return
                }

                checkNetwork()

                interval = setInterval(checkNetwork, checkInterval)
            }, delay)
        }

        // Give iOS a moment to restore Wi‑Fi after returning
        // from the background before testing latency.
        startPolling(1000)

        const appStateSubscription = AppState.addEventListener("change", (nextAppState) => {
            if (nextAppState === "active") {
                startPolling(1000)
            } else {
                stopPolling()
            }
        })

        return () => {
            isMounted = false
            stopPolling()
            appStateSubscription.remove()
        }
    }, [checkInterval, latencyThreshold])
}
