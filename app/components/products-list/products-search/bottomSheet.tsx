import { FlatList, Text, View } from "react-native"
import { RefObject } from "react"
import ExpoBottomSheet from "@expo/ui/community/bottom-sheet"
import Product from "@/components/products-search/product"
import { useProductsSearchList } from "@/hooks/products-search/useProductsSearchList"
import useThemes from "@/hooks/themes/useThemes"
import AppBottomSheet from "@/components/native/appBottomSheet"
import { BlurView } from "expo-blur"

type Props = {
    sheetRef: RefObject<ExpoBottomSheet | null>
    onClose: () => void
}

export default function BottomSheet({ sheetRef, onClose }: Props) {
    const { vars, theme } = useThemes()
    const { states, refs, actions } = useProductsSearchList()

    return (
        <AppBottomSheet
            ref={sheetRef}
            index={-1}
            snapPoints={["50%", "75%", "100%"]}
            enablePanDownToClose
            onClose={onClose}
            backgroundMode="adaptive"
            backgroundColor={vars.backgroundColor}
        >
            <View
                style={{
                    flex: 1,
                    paddingHorizontal: 12,
                }}
            >
                <View
                    style={{
                        position: "absolute",
                        top: -40,
                        left: 0,
                        right: 0,
                        height: 88,
                        zIndex: 10,
                        overflow: "hidden",
                    }}
                >
                    <BlurView
                        intensity={10}
                        tint={theme === "light" ? "light" : "dark"}
                        style={{
                            flex: 1,
                            paddingHorizontal: 20,
                            paddingTop: 48,
                            paddingBottom: 5,
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                    >
                        <Text
                            style={{
                                marginBottom: 10,
                                color: vars.textColor,
                                opacity: 0.2,
                            }}
                        >
                            Found results: {states.total}
                        </Text>

                        <Text
                            style={{
                                marginBottom: 10,
                                color: vars.textColor,
                                opacity: 0.2,
                            }}
                        >
                            Last updated: {states.dateUpdated}
                        </Text>
                    </BlurView>
                </View>

                <FlatList
                    ref={refs.flatListRef}
                    data={states.products}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: 64 }}
                    keyExtractor={(item, index) => item.pid + index}
                    renderItem={({ item }) => <Product product={item} />}
                    ListEmptyComponent={
                        states.products.length === 0 ? (
                            <Text
                                style={{
                                    paddingLeft: 10,
                                    marginTop: 10,
                                    color: vars.textColor,
                                }}
                            >
                                No results found
                            </Text>
                        ) : null
                    }
                    onEndReached={actions.getNextPage}
                    onEndReachedThreshold={0.5}
                />
            </View>
        </AppBottomSheet>
    )
}
