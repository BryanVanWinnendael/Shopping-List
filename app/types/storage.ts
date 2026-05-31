export type Image = {
    large: string
    small: string
}

export type UploadImageResponse = Image

export type DeleteImageRequest = {
    url: string
}

export type DeleteImageResponse = {
    message: string
    large?: string | null
}

export type DeleteStorageResponse = {
    message: string
    id?: string | null
}
