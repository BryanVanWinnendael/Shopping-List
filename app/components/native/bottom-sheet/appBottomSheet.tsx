import { forwardRef, ReactNode } from "react"
import DevelopmentBottomSheet from "@/components/native/bottom-sheet/developmentBottomSheet"
import ProductionBottomSheet from "@/components/native/bottom-sheet/productionBottomSheet"
import useThemes from "@/hooks/themes/useThemes"

export type BottomSheetRef = {
    close: () => void
    collapse: () => void
    dismiss: () => void
    expand: () => void
    forceClose: () => void
    present: () => void
    snapToIndex: (index: number) => void
    snapToPosition: (position: string | number) => void
}

export type BottomSheetProps = {
    children: ReactNode
    index?: number
    snapPoints?: (string | number)[]
    enablePanDownToClose?: boolean
    enableDynamicSizing?: boolean
    onClose?: () => void
    backgroundMode?: "default" | "adaptive"
    backgroundColor?: string
    appearance?: "light" | "dark"
}

const AppBottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>((props, ref) => {
    const { vars, appearance } = useThemes()

    const bottomSheetAppearance = props.appearance ?? appearance
    const bottomSheetBackgroundColor = props.backgroundColor ?? vars.secondaryBackgroundColor

    const bottomSheetProps: BottomSheetProps = {
        ...props,
        appearance: bottomSheetAppearance,
        backgroundColor: bottomSheetBackgroundColor,
    }

    if (__DEV__) {
        return <DevelopmentBottomSheet {...bottomSheetProps} ref={ref} />
    }

    return <ProductionBottomSheet {...bottomSheetProps} ref={ref} />
})

AppBottomSheet.displayName = "AppBottomSheet"

export default AppBottomSheet
