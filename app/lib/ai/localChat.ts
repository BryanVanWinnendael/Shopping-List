import { generateText, type LLMMessage } from "expo-ai-kit"
import { ChatOptions } from "@/types/ai"
import { createSystemPrompt } from "@/lib/ai/prompt"

export async function completeLocalChat({ page, pathname, messages, context }: ChatOptions): Promise<string> {
    const system = createSystemPrompt({
        page,
        pathname,
        context,
    })

    const llmMessages: LLMMessage[] = [
        {
            role: "system",
            content: system,
        },
        ...messages.map(
            (message): LLMMessage => ({
                role: message.role,
                content: message.content,
            })
        ),
    ]

    const result = await generateText(llmMessages)

    return result.text.trim()
}
