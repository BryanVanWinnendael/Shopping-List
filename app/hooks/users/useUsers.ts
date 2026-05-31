import {useCallback, useRef} from "react"
import BottomSheet from "@gorhom/bottom-sheet"

export default function useUsers() {
    const bottomSheetRef = useRef<BottomSheet>(null)

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
