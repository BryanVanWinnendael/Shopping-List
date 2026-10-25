import CommunitySegmentedControl from "@expo/ui/community/segmented-control"
import { Host, Picker, Text as SwiftUIText } from "@expo/ui/swift-ui"
import { pickerStyle, tag } from "@expo/ui/swift-ui/modifiers"

type Props = {
    values: string[]
    selectedIndex: number
    appearance?: "light" | "dark"
    onChange: (index: number, value: string) => void
    style?: any
}

export default function AppSegmentedControl({ values, selectedIndex, appearance = "light", onChange, style }: Props) {
    if (__DEV__) {
        return (
            <CommunitySegmentedControl
                values={values}
                selectedIndex={selectedIndex}
                appearance={appearance}
                onChange={(event) => {
                    const index = event.nativeEvent.selectedSegmentIndex

                    const value = values[index]

                    if (value) {
                        onChange(index, value)
                    }
                }}
                style={style}
            />
        )
    }

    const selectedValue = values[selectedIndex] ?? values[0]

    return (
        <Host style={style} colorScheme={appearance}>
            <Picker
                selection={selectedValue}
                onSelectionChange={(selection) => {
                    const index = values.indexOf(String(selection))

                    if (index >= 0) {
                        onChange(index, values[index])
                    }
                }}
                modifiers={[pickerStyle("segmented")]}
            >
                {values.map((value) => (
                    <SwiftUIText key={value} modifiers={[tag(value)]}>
                        {value}
                    </SwiftUIText>
                ))}
            </Picker>
        </Host>
    )
}
