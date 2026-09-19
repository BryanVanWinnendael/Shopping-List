import { FlatList, Text, View } from "react-native"
import { RefObject } from "react"
import ExpoBottomSheet from "@expo/ui/community/bottom-sheet"
import Product from "@/components/products-search/product"
import { useProductsSearchList } from "@/hooks/products-search/useProductsSearchList"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    sheetRef: RefObject<ExpoBottomSheet | null>
    onClose: () => void
}

export default function BottomSheet({ sheetRef, onClose }: Props) {
    const { vars } = useThemes()
    const { states, refs, actions } = useProductsSearchList()

    return (
        <ExpoBottomSheet ref={sheetRef} index={-1} snapPoints={["50%"]} enablePanDownToClose onClose={onClose}>
            <View
                style={{
                    flex: 1,
                    paddingBottom: 20,
                    maxHeight: 670,
                }}
            >
                <View
                    style={{
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
                </View>

                <FlatList
                    ref={refs.flatListRef}
                    data={states.products}
                    showsVerticalScrollIndicator={false}
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
        </ExpoBottomSheet>
    )
}
