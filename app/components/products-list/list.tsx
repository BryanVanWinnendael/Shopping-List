import { useMemo, useRef } from "react"
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, View } from "react-native"
import { Product as ProductType } from "@/types/list"
import { useProductsListStore } from "@/stores/useProductsListStore"
import Product from "@/components/products-list/product"
import { ProductRowSkeleton } from "@/components/native/skeleton"
import useThemes from "@/hooks/themes/useThemes"
import { Category } from "@/types/generated/models/category"
import { HEADER_HEIGHT } from "@/lib/constants"

const SKELETON_ROWS = Array.from({ length: 7 }, (_, index) => index)

type Props = {
    openSearchProductsBottomSheet: () => void
    openEditModal: () => void
    setProduct: (product: ProductType) => void
    searchProduct: (product: string, category: Category) => void
    setQuery: (query: string | null) => void
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
}

type Row =
    | { kind: "header"; key: string; title: string; count: number }
    | { kind: "product"; key: string; product: ProductType }

function SectionHeader({ title, count }: { title: string; count: number }) {
    const { vars } = useThemes()

    return (
        <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: vars.textColor }]} numberOfLines={1}>
                {title}
            </Text>
            <View style={[styles.countPill, { backgroundColor: vars.secondaryBackgroundColor }]}>
                <Text style={[styles.countText, { color: vars.secondaryTextColor }]}>{count}</Text>
            </View>
        </View>
    )
}

export default function List({
    openSearchProductsBottomSheet,
    openEditModal,
    setProduct,
    searchProduct,
    setQuery,
    onScroll,
}: Props) {
    const { products } = useProductsListStore()
    const scrollRef = useRef<FlatList>(null)

    const openEditProductModal = (product: ProductType) => {
        setProduct(product)
        openEditModal()
    }

    const rows = useMemo<Row[] | null>(() => {
        if (!products) return null

        const groups = new Map<string, ProductType[]>()
        const order: string[] = []
        const ungrouped: ProductType[] = []

        for (const product of Object.values(products)) {
            const recipeId = product.recipe?.id

            if (!recipeId) {
                ungrouped.push(product)
                continue
            }

            if (!groups.has(recipeId)) {
                groups.set(recipeId, [])
                order.push(recipeId)
            }

            groups.get(recipeId)!.push(product)
        }

        const toProductRow = (product: ProductType): Row => ({ kind: "product", key: product.id, product })

        // No recipe items: plain product rows, no headers.
        if (order.length === 0) return ungrouped.map(toProductRow)

        const result: Row[] = []

        if (ungrouped.length > 0) {
            result.push({ kind: "header", key: "header-ungrouped", title: "Shopping list", count: ungrouped.length })
            result.push(...ungrouped.map(toProductRow))
        }

        for (const recipeId of order) {
            const items = groups.get(recipeId)!

            result.push({
                kind: "header",
                key: `header-${recipeId}`,
                title: items[0].recipe!.title,
                count: items.length,
            })
            result.push(...items.map(toProductRow))
        }

        return result
    }, [products])

    if (products === null || rows === null) {
        return (
            <FlatList
                data={SKELETON_ROWS}
                keyExtractor={(item) => `skeleton-${item}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
                renderItem={({ index }) => <ProductRowSkeleton index={index} />}
            />
        )
    }

    return (
        <FlatList
            onScroll={onScroll}
            ref={scrollRef}
            data={rows}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
            renderItem={({ item }) =>
                item.kind === "header" ? (
                    <SectionHeader title={item.title} count={item.count} />
                ) : (
                    <Product
                        product={item.product}
                        scrollRef={scrollRef}
                        openEditProductModal={openEditProductModal}
                        openSearchProductsBottomSheet={openSearchProductsBottomSheet}
                        searchProduct={searchProduct}
                        setQuery={setQuery}
                    />
                )
            }
        />
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingTop: HEADER_HEIGHT,
        paddingBottom: HEADER_HEIGHT + 85,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        flex: 1,
        minWidth: 0,
    },
    countPill: {
        minWidth: 24,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 7,
    },
    countText: {
        fontSize: 11,
        fontWeight: "600",
    },
})
