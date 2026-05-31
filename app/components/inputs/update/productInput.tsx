import GlassOrBlurView from "@/components/glassOrBlurView"
import { StyleSheet, TextInput } from "react-native"
import { PressableScale } from "pressto"
import Svg, { Path } from "react-native-svg"
import { Product } from "@/types/list"
import useThemes from "@/hooks/themes/useThemes"
import { useSettingsStore } from "@/stores/useSettingsStore"

type Props = {
    product: Product | null
    value: string
    updateName: (value: string) => void
    updateProduct: () => void
}

export default function ProductInput({ product, value, updateName, updateProduct }: Props) {
    const { vars } = useThemes()
    const { theme, aColorUse } = useSettingsStore()

    return (
        <GlassOrBlurView
            borderRadius={20}
            style={styles.glassView}
            backgroundColor={vars.secondaryBackgroundColor}
            borderColor={vars.secondaryBackgroundColor}
        >
            <TextInput
                autoFocus
                value={value ? value : product?.name}
                onChangeText={updateName}
                placeholder="Edit product..."
                placeholderTextColor="#aaa"
                style={[styles.textInput, { color: vars.textColor }]}
                keyboardAppearance={theme === "light" ? "light" : "dark"}
            />

            <PressableScale
                onPress={updateProduct}
                style={[
                    styles.sendButton,
                    {
                        backgroundColor: aColorUse.input ? vars.accentColor : vars.secondaryBorderColor,
                        borderColor: aColorUse.input ? `${vars.accentColor}50` : `${vars.secondaryBackgroundColor}50`,
                    },
                ]}
            >
                <Svg width="24" height="24" viewBox="0 0 25 25" fill="none">
                    <Path
                        d="M18.455 9.8834L7.063 4.1434C6.76535 3.96928 6.40109 3.95274 6.08888 4.09916C5.77667 4.24558 5.55647 4.53621 5.5 4.8764C5.5039 4.98942 5.53114 5.10041 5.58 5.2024L7.749 10.4424C7.85786 10.7903 7.91711 11.1519 7.925 11.5164C7.91714 11.8809 7.85789 12.2425 7.749 12.5904L5.58 17.8304C5.53114 17.9324 5.5039 18.0434 5.5 18.1564C5.55687 18.4961 5.77703 18.7862 6.0889 18.9323C6.40078 19.0785 6.76456 19.062 7.062 18.8884L18.455 13.1484C19.0903 12.8533 19.4967 12.2164 19.4967 11.5159C19.4967 10.8154 19.0903 10.1785 18.455 9.8834V9.8834Z"
                        stroke={aColorUse.input ? "#fff" : vars.textColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </Svg>
            </PressableScale>
        </GlassOrBlurView>
    )
}

const styles = StyleSheet.create({
    glassView: {
        paddingBottom: 16,
        paddingVertical: 4,
        paddingHorizontal: 16,
        height: 120,
    },
    sendButton: {
        borderRadius: 50,
        height: 40,
        width: 60,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 23,
        alignSelf: "flex-end",
    },
    textInput: { flex: 1, height: 32 },
})
