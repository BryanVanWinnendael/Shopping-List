import { MEAL_TYPES } from "@/lib/constants"
import useThemes from "@/hooks/themes/useThemes"
import { MealType } from "@/types/generated/models/meal_type"
import AppSegmentedControl from "@/components/native/appSegmentedControl"

type Props = {
    value: MealType
    onChange: (val: MealType) => void
}

export default function MealTypeSegment({ value, onChange }: Props) {
    const { appearance } = useThemes()
    const selectedIndex = MEAL_TYPES.findIndex((type) => type.toLowerCase() === value.toLowerCase())

    return (
        <AppSegmentedControl
            values={MEAL_TYPES}
            selectedIndex={selectedIndex >= 0 ? selectedIndex : 0}
            appearance={appearance}
            onChange={(_, nextValue) => {
                onChange(nextValue as MealType)
            }}
            style={{
                width: "100%",
                height: 48,
            }}
        />
    )
}
