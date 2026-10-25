import { useEffect } from "react"
import { Stack } from "expo-router"
import { useViewLaterStore } from "@/stores/useViewLaterStore"

export default function OnlineRecipesLayout() {
    const loadViewLater = useViewLaterStore((state) => state.loadViewLater)

    useEffect(() => {
        loadViewLater()
    }, [loadViewLater])

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="details" />
        </Stack>
    )
}
