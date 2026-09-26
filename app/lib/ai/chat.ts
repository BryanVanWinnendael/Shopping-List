import { ChatOptions } from "@/types/ai"
import { completeFallbackChat } from "./fallbackChat"

export async function chat(options: ChatOptions) {
    switch (options.provider) {
        case "cloud":
            return completeFallbackChat(options)

        case "built-in":
            return completeBuiltInChat(options)

        case "downloaded":
            return completeDownloadedChat(options)

        default:
            return completeFallbackChat(options)
    }
}

async function completeBuiltInChat(options: ChatOptions) {
    try {
        const { completeLocalChat } = await import("./localChat")

        return await completeLocalChat(options)
    } catch (error) {
        console.warn("Built-in AI failed, falling back to cloud AI:", error)

        return completeFallbackChat(options)
    }
}

async function completeDownloadedChat(options: ChatOptions) {
    try {
        const { completeLocalChat } = await import("./localChat")

        return await completeLocalChat(options)
    } catch (error) {
        console.warn("Downloaded AI failed, falling back to cloud AI:", error)

        return completeFallbackChat(options)
    }
}
