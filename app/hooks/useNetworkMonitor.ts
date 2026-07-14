import { useEffect, useRef } from "react"
import { Alert } from "react-native"
import * as Network from "expo-network"

export function useNetworkMonitor({ checkInterval = 30000, latencyThreshold = 1500 } = {}) {
    const alertShown = useRef(false)

    const checkNetwork = async () => {
        try {
            const networkState = await Network.getNetworkStateAsync()

            if (!networkState.isConnected) {
                showAlert("No Internet Connection", "Please check your network connection.")
                return
            }

            if (networkState.type === Network.NetworkStateType.WIFI) {
                await checkInternetSpeed()
            }
        } catch (error) {
            console.log("Network check error:", error)
        }
    }

    const checkInternetSpeed = async () => {
        const start = Date.now()

        try {
            await fetch("https://www.google.com", {
                method: "HEAD",
            })

            const latency = Date.now() - start

            if (latency > latencyThreshold) {
                showAlert("Slow Connection", "Your WiFi connection seems slow. Please check your network.")
            } else {
                alertShown.current = false
            }
        } catch (error) {
            showAlert("Network Error", "Unable to reach the internet.")
        }
    }

    const showAlert = (title: string, message: string) => {
        // Prevent alert spam
        if (alertShown.current) return

        alertShown.current = true

        Alert.alert(title, message, [
            {
                text: "OK",
                onPress: () => {
                    alertShown.current = false
                },
            },
        ])
    }

    useEffect(() => {
        checkNetwork()

        const interval = setInterval(() => {
            checkNetwork()
        }, checkInterval)

        return () => clearInterval(interval)
    }, [])
}
