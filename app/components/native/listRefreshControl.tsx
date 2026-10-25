import { useCallback } from "react"
import { RefreshControl } from "react-native"
import * as Haptics from "expo-haptics"

import useThemes from "@/hooks/themes/useThemes"
import { HEADER_HEIGHT } from "@/lib/constants"

type Props = {
    refreshing: boolean
    onRefresh: () => void
    /**
     * How far the spinner is pushed down from the top of the list. Defaults to the
     * header height so the indicator clears the transparent header and status bar
     * instead of being clipped by them. Lists that already reserve that space in
     * their own layout pass 0.
     */
    offset?: number
}

// The default control renders its spinner at the very top of the scroll view,
// which sits behind the transparent header on every screen, and it uses a fixed
// platform tint that ignores the app theme. Both are themed here instead.
export default function ListRefreshControl({ refreshing, onRefresh, offset = HEADER_HEIGHT }: Props) {
    const { vars } = useThemes()

    // Fires when the pull crosses the threshold and the refresh actually starts,
    // so it reads as confirmation of the gesture rather than of the list changing.
    const handleRefresh = useCallback(() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)
        onRefresh()
    }, [onRefresh])

    return (
        <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={vars.textColor}
            colors={[vars.textColor]}
            progressBackgroundColor={vars.backgroundColor}
            progressViewOffset={offset}
        />
    )
}
