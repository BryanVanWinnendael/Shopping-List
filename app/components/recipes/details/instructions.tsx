import { Recipe } from "@/types/recipes"
import useThemes from "@/hooks/themes/useThemes"
import { Text, View } from "react-native"
import { PressableScale } from "pressto"
import { Expand } from "lucide-react-native"

type Props = {
    recipe: Recipe
    open: () => void
}

export default function Instructions({ recipe, open }: Props) {
    const { vars } = useThemes()

    return (
        <>
            <View style={{ marginTop: 24 }}>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 16,
                    }}
                >
                    <Text
                        style={{
                            color: vars.textColor,
                            fontSize: 22,
                            fontWeight: "700",
                        }}
                    >
                        Instructions
                    </Text>

                    <PressableScale onPress={open}>
                        <Expand size={20} color={vars.textColor} />
                    </PressableScale>
                </View>

                {recipe.instructions?.map((instruction, index) => (
                    <View
                        key={index}
                        style={{
                            flexDirection: "row",
                            marginBottom: 16,
                        }}
                    >
                        <Text
                            style={{
                                color: vars.accentColor,
                                fontWeight: "700",
                                marginRight: 12,
                                minWidth: 24,
                                fontSize: 16,
                            }}
                        >
                            {index + 1}.
                        </Text>

                        <Text
                            style={{
                                color: vars.textColor,
                                flex: 1,
                                lineHeight: 22,
                                fontSize: 16,
                            }}
                        >
                            {instruction}
                        </Text>
                    </View>
                ))}
            </View>
        </>
    )
}
