import GlassOrBlurView from "@/components/glassOrBlurView"
import useThemes from "@/hooks/themes/useThemes"

export default function CustomHeader() {
    const { vars } = useThemes()
    return (
        <GlassOrBlurView
            style={{ flex: 1, borderRadius: 8, padding: 2, overflow: "hidden" }}
            borderColor={vars.backgroundColor}
            blurBorderWidth={0}
        />
    )
}
