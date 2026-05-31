import { useState } from "react"

export function useUpdateProductModal() {
    const [visible, setVisible] = useState<boolean>(false)

    const open = () => {
        setVisible(true)
    }

    const close = () => {
        setVisible(false)
    }

    return {
        states: {
            visible,
        },
        actions: {
            close,
            open,
        },
    }
}
