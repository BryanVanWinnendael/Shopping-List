import { generateText, type LLMMessage } from "expo-ai-kit"
import { useAiContextStore } from "@/stores/useAiContextStore"
import { ChatOptions } from "@/types/ai"
import { createSystemPrompt } from "@/lib/ai/prompt"
import { logsClient } from "@/lib/logs"

export async function completeLocalChat({ page, pathname, messages, context }: ChatOptions): Promise<string> {
    const provider = useAiContextStore.getState().provider

    logsClient.createLog(
        `AI: Using Local Chat — ${
            provider === "downloaded"
                ? "Downloaded Model"
                : provider === "built-in"
                  ? "Built-in Model"
                  : `Provider: ${provider ?? "None"}`
        }`,
        "GET",
        false
    )

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
