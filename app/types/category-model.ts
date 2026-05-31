export type Category =
    | "bread"
    | "drinks"
    | "housekeeping"
    | "meat"
    | "fish"
    | "fruit/vegetables"
    | "fridge"
    | "dairy"
    | "world"
    | "breakfast"
    | "snacks"
    | "carbs"
    | "sugar/desserts"
    | "sauce/spices"
    | "preserved"
    | "hygiene"
    | "freezer"
    | "remaining"

export type TrainModelResponse = {
    model: string
    accuracy: number
}

export type CreateCategoryRequest = {
    category: Category
    product: string
}

export type CreateCategoryResponse = {
    category: Category
    product: string
}
export type GetCategoryResponse = {
    category: Category
    product: string
}
