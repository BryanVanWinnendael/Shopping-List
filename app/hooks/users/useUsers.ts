import { useCallback, useRef } from "react"
import { BottomSheetRef } from "@/components/native/appBottomSheet"

export default function useUsers() {
    const bottomSheetRef = useRef<BottomSheetRef>(null)

    const open = useCallback(() => {
        bottomSheetRef.current?.expand()
    }, [])

    const close = useCallback(() => {
        bottomSheetRef.current?.close()
    }, [])

    return {
        actions: {
            open,
            close,
        },
        refs: {
            bottomSheetRef,
        },
    }
}
