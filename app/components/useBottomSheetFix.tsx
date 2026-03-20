import { useCallback, useState } from "react"
import { useFocusEffect } from "@react-navigation/native"

export function useBottomSheetFix() {
  const [key, setKey] = useState(0)
  const [ready, setReady] = useState(false)

  useFocusEffect(
    useCallback(() => {
      setReady(false)

      const id = requestAnimationFrame(() => {
        setKey((k) => k + 1)
        setReady(true)
      })

      return () => cancelAnimationFrame(id)
    }, []),
  )

  return { key, ready }
}
