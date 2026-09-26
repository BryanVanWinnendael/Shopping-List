export type ChatMessage = {
    role: "user" | "assistant"
    content: string
}

export type ChatContext = {
    type: string
    [key: string]: unknown
}

export type ChatOptions = {
    page: string
    pathname: string
    messages: ChatMessage[]
    context: ChatContext
    provider: AIProvider
    onDownloadProgress?: (progress: number) => void
}

export type AIProvider = "cloud" | "built-in" | "downloaded" | "disabled"
