import { PressableScale } from "pressto"
import { CronProduct } from "@/types/cron"
import ProductPreview from "@/components/products-list/productPreview"
import { useMemo } from "react"
import { Product } from "@/types/list"

type Props = {
    cronProduct: CronProduct
    open: (cronProduct: CronProduct) => void
}

export function BottomSheetButton({ cronProduct, open }: Props) {
    const product = useMemo(() => {
        return {
            name: cronProduct.product,
            category: cronProduct.category,
            user: cronProduct.user,
            date: 123,
            type: "text",
            id: cronProduct.id,
        } as Product
    }, [cronProduct])

    return (
        <PressableScale onPress={() => open(cronProduct)}>
            <ProductPreview product={product} />
        </PressableScale>
    )
}
