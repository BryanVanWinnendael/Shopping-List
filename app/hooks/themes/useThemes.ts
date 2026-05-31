import { useCallback, useMemo, useRef } from "react"
import BottomSheet from "@gorhom/bottom-sheet"
import { useSettingsStore } from "@/stores/useSettingsStore"
import { User } from "@/types"

function capitalize(str: string) {
    if (!str) return str
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export default function useThemes() {
    const { theme, aColor, userColors, fontSize, user } = useSettingsStore()
    const bottomSheetRef = useRef<BottomSheet>(null)

    const open = () => {
        bottomSheetRef.current?.expand()
    }

    const close = () => {
        bottomSheetRef.current?.close()
    }

    const backgroundColor = useMemo(() => {
        switch (theme) {
            case "dark":
                return "#080808"
            case "true dark":
                return "#000000"
            default:
                return "white"
        }
    }, [theme])

    const secondaryBackgroundColor = useMemo(() => {
        switch (theme) {
            case "dark":
                return "#0F0F0F"
            case "true dark":
                return "#070707"
            default:
                return "#F2F2F2"
        }
    }, [theme])

    const borderColor = useMemo(() => {
        switch (theme) {
            case "dark":
                return "#0f0f0f"
            case "true dark":
                return "#070707"
            default:
                return "#f4f2f2"
        }
    }, [theme])

    const secondaryBorderColor = useMemo(() => {
        switch (theme) {
            case "dark":
                return "#171717"
            case "true dark":
                return "#0F0F0F"
            default:
                return "#e5e7eb"
        }
    }, [theme])

    const textColor = useMemo(() => {
        if (theme === "light") return "black"
        return "white"
    }, [theme])

    const textSize = fontSize / 2
    const labelSize = fontSize / 3

    const getLabelColor = useCallback(
        (givenUser?: User) => {
            const defaultColor = theme === "light" ? "#9ca3af" : "#50555C"
            if (!userColors.enabled) return defaultColor
            if (!user) return defaultColor
            if (!givenUser) {
                const userKey = capitalize(user) as keyof typeof userColors
                return userColors.colors[userKey] ?? defaultColor
            } else {
                const userKey = capitalize(givenUser) as keyof typeof userColors
                console.log(userKey, userColors)
                return userColors.colors[userKey] ?? defaultColor
            }
        },
        [userColors]
    )

    return {
        actions: {
            open,
            close,
            getLabelColor,
        },
        refs: {
            bottomSheetRef,
        },
        vars: {
            backgroundColor,
            secondaryBackgroundColor,
            borderColor,
            secondaryBorderColor,
            textColor,
            accentColor: aColor,
            textSize,
            labelSize,
        },
        theme,
    }
}
