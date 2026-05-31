import { PressableScale } from "pressto"
import ProductPreview from "@/components/products-list/productPreview"
import { Product } from "@/types/list"

type Props = {
    product: Product
    open: (product: Product) => void
}

export function BottomSheetButton({ product, open }: Props) {
    return (
        <PressableScale onPress={() => open(product)}>
            <ProductPreview product={product} />
        </PressableScale>
    )
}
