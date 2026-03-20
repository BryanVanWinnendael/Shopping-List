import { GlassOrBlurView } from "./glassOrBlurView"

export function CustomHeader() {
  return (
    <GlassOrBlurView
      style={{ flex: 1, borderRadius: 12, padding: 2, overflow: "hidden" }}
      blur={20}
    />
  )
}
