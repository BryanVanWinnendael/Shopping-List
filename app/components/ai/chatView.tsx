import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native"
import { useGlobalSearchParams } from "expo-router"
import { RotateCcw, SendIcon } from "lucide-react-native"
import { BlurView } from "expo-blur"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { PressableScale } from "pressto"
import Markdown from "react-native-markdown-display"
import useThemes from "@/hooks/themes/useThemes"
import { getAiContext } from "@/lib/ai/context"
import { chat } from "@/lib/ai/chat"
import { getCapabilitiesReply, isCapabilitiesQuestion } from "@/lib/ai/capabilities"
import { formatTokens, loadTokenUsage, useTokenUsage } from "@/lib/ai/usage"
import { CloudError } from "@/lib/ai/fallbackChat"
import {
    BAR_FONT_SIZE,
    BAR_PADDING_H,
    BORDER_RADIUS_L,
    COMPOSER_MIN_HEIGHT,
    COMPOSER_SEND_SIZE,
    DOCK_BOTTOM,
} from "@/lib/theme"
import { AIProvider } from "@/types/ai"
import { Image } from "expo-image"
import AssistantIcon from "@/assets/assistant.png"

type Props = {
    pathname: string
    provider: AIProvider
}

type Message = {
    id: string
    role: "assistant" | "user"
    content: string
    failed?: boolean
    error?: string
}

const friendlyError = (error: unknown) => {
    if (error instanceof CloudError) {
        const name = error.target.provider.name

        if (error.status === 401 || error.status === 403) {
            return `${name} rejected the API key. Check it in Settings.`
        }

        if (error.status === 402) {
            return `${name} is out of credit. It will try the next provider.`
        }

        if (error.status === 429) {
            return `${name} is rate limited. Wait a moment and resend.`
        }

        return `${name} failed (${error.status}). Resend to try again.`
    }

    if (error instanceof Error && error.message === "No cloud AI provider is configured") {
        return "No cloud key set. Add one in Settings under AI Assistant."
    }

    return "Couldn't reach the AI. Resend to try again."
}

const PAGE_TITLES: Record<string, string> = {
    "/": "Shopping List",
    "/recipes": "Recipes",
    "/online-recipes": "Online Recipes",
    "/searchProducts": "Search Products",
    "/weekly": "Weekly List",
    "/weeklyCategories": "Weekly Categories",
    "/settings": "Settings",
}

const RECIPE_DETAIL_REGEX = /^\/recipes\/[^/]+$/

const PROVIDER_LABELS: Record<AIProvider, string> = {
    cloud: "Cloud AI",
    "built-in": "Built-in AI",
    disabled: "AI",
}

function getPageTitle(pathname: string, recipeTitle?: string) {
    if (RECIPE_DETAIL_REGEX.test(pathname)) {
        return recipeTitle || "Recipe details"
    }

    if (pathname === "/online-recipes/details") {
        return "Online recipe details"
    }

    return PAGE_TITLES[pathname] ?? "Current page"
}

const MessageBubble = memo(function MessageBubble({
    message,
    onResend,
}: {
    message: Message
    onResend: (id: string, content: string) => void
}) {
    const { vars } = useThemes()
    const mine = message.role === "user"

    const markdownStyles = useMemo(
        () => ({
            body: { ...styles.messageText, color: vars.textColor },
            strong: { fontWeight: "700" as const, color: vars.textColor },
            em: { fontStyle: "italic" as const, color: vars.textColor },
            bullet_list: styles.markdownList,
            ordered_list: styles.markdownList,
            list_item: styles.markdownListItem,
            code_inline: {
                backgroundColor: vars.secondaryBackgroundColor,
                borderRadius: 4,
                paddingHorizontal: 4,
            },
            code_block: {
                backgroundColor: vars.secondaryBackgroundColor,
                borderRadius: 8,
                padding: 10,
            },
            link: { color: vars.accentColor },
        }),
        [vars.textColor, vars.secondaryBackgroundColor, vars.accentColor]
    )

    return (
        <View style={[styles.messageWrap, mine ? styles.messageMine : styles.messageTheirs]}>
            <View
                style={[
                    styles.message,
                    mine ? styles.messageMine : styles.messageTheirs,
                    { backgroundColor: mine ? vars.accentColor : vars.secondaryBackgroundColor },
                ]}
            >
                {mine ? (
                    <Text style={[styles.messageText, styles.messageTextMine]}>{message.content}</Text>
                ) : (
                    <Markdown style={markdownStyles}>{message.content}</Markdown>
                )}
            </View>

            {mine && message.failed && (
                <>
                    {!!message.error && <Text style={[styles.errorText, { color: "#ef4444" }]}>{message.error}</Text>}
                    <PressableScale
                        onPress={() => onResend(message.id, message.content)}
                        accessibilityRole="button"
                        accessibilityLabel="Resend message"
                        style={styles.resend}
                    >
                        <RotateCcw size={13} color={vars.accentColor} />
                        <Text style={[styles.resendText, { color: vars.accentColor }]}>Tap to resend</Text>
                    </PressableScale>
                </>
            )}
        </View>
    )
})

export default function ChatView({ pathname, provider }: Props) {
    const { vars, appearance } = useThemes()

    const { title } = useGlobalSearchParams<{ title?: string }>()
    const recipeTitle = Array.isArray(title) ? title[0] : title

    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [sending, setSending] = useState(false)
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
    const [stage, setStage] = useState<string | null>(null)

    const listRef = useRef<FlatList<Message>>(null)
    const idCounter = useRef(0)
    const messagesRef = useRef<Message[]>([])
    const sendingRef = useRef(false)

    messagesRef.current = messages
    sendingRef.current = sending

    const pageTitle = useMemo(() => getPageTitle(pathname, recipeTitle), [pathname, recipeTitle])
    const canSend = !!input.trim() && !sending

    const { totalTokens, window } = useTokenUsage()
    const usageSummary = window
        ? `${formatTokens(Math.max(0, window.limit - window.remaining))}/${formatTokens(window.limit)}`
        : totalTokens > 0
          ? `${formatTokens(totalTokens)} lifetime`
          : ""

    // Counter-based ids can't collide the way Date.now() can for two messages in the same millisecond.
    const createId = (prefix: string) => `${prefix}-${++idCounter.current}`

    useEffect(() => {
        setMessages([
            {
                id: `welcome-${pathname}-${recipeTitle ?? ""}`,
                role: "assistant",
                content: `I can help with ${pageTitle}. What would you like to do?`,
            },
        ])
        setInput("")
    }, [pathname, pageTitle, recipeTitle])

    useEffect(() => {
        loadTokenUsage()
    }, [])

    // Scroll to the newest message, and to the thinking indicator when it appears.
    useEffect(() => {
        if (!messages.length) return

        requestAnimationFrame(() => {
            listRef.current?.scrollToEnd({ animated: true })
        })
    }, [messages.length, sending])

    const sendContent = useCallback(
        async (content: string, retryId?: string) => {
            if (!content || sendingRef.current) return

            const messageId = retryId ?? createId("user")

            if (retryId) {
                setMessages((current) =>
                    current.map((message) =>
                        message.id === retryId ? { ...message, failed: false, error: undefined } : message
                    )
                )
            } else {
                setInput("")
                setMessages((current) => [...current, { id: messageId, role: "user", content }])
            }

            // Capability questions get the curated list instantly, no model call.
            if (!retryId && isCapabilitiesQuestion(content)) {
                setMessages((current) => [
                    ...current,
                    { id: createId("assistant"), role: "assistant", content: getCapabilitiesReply(pageTitle) },
                ])
                return
            }

            // The failed message is already in history on retry; only append on first send.
            const history = retryId
                ? [...messagesRef.current]
                : [...messagesRef.current, { id: messageId, role: "user" as const, content }]

            setSending(true)
            setStage("Thinking…")
            setDownloadProgress(null)

            // Read the context when the user sends, so it contains the latest app data.
            const context = getAiContext(pathname)

            try {
                const reply = await chat({
                    page: pageTitle,
                    pathname,
                    messages: history,
                    context,
                    provider,
                    onDownloadProgress: setDownloadProgress,
                    onStage: setStage,
                })

                setMessages((current) => [
                    ...current,
                    {
                        id: createId("assistant"),
                        role: "assistant",
                        content: reply || "I couldn't generate a response.",
                    },
                ])
            } catch (error) {
                console.error("AI chat failed:", error)

                setMessages((current) =>
                    current.map((message) =>
                        message.id === messageId ? { ...message, failed: true, error: friendlyError(error) } : message
                    )
                )
            } finally {
                setSending(false)
                setDownloadProgress(null)
                setStage(null)
            }
        },
        [pageTitle, pathname, provider]
    )

    const send = async () => {
        await sendContent(input.trim())
    }

    const resend = useCallback((id: string, content: string) => sendContent(content, id), [sendContent])

    const renderItem = useCallback(
        ({ item }: { item: Message }) => <MessageBubble message={item} onResend={resend} />,
        [resend]
    )

    return (
        <View style={styles.container}>
            <View style={styles.headerOverlay}>
                <BlurView intensity={10} tint={appearance} style={styles.headerBlur}>
                    <View style={styles.headerContent}>
                        <Image source={AssistantIcon} style={{ width: 56, height: 56 }} />

                        <View style={styles.titleGroup}>
                            <Text style={[styles.title, { color: vars.textColor }]}>Assistant</Text>
                            <Text style={[styles.context, { color: vars.textColor }]} numberOfLines={1}>
                                {PROVIDER_LABELS[provider]}
                                {usageSummary ? ` · ${usageSummary}` : ""}
                            </Text>
                        </View>
                    </View>
                </BlurView>
            </View>

            <KeyboardAvoidingView
                style={styles.keyboard}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={0}
            >
                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.messages}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={<View style={styles.listHeaderSpacer} />}
                    ListFooterComponent={
                        <>
                            {sending && (
                                <View style={[styles.thinking, { backgroundColor: vars.secondaryBackgroundColor }]}>
                                    <ActivityIndicator color={vars.accentColor} size="small" />
                                    <Text style={[styles.thinkingText, { color: vars.textColor }]}>
                                        {downloadProgress === null
                                            ? (stage ?? "Thinking…")
                                            : `Downloading the offline model… ${downloadProgress}%`}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.listFooterSpacer} />
                        </>
                    }
                />

                <View style={styles.composerOverlay}>
                    <LiquidGlassView style={styles.glassInput} isInteractive>
                        <TextInput
                            value={input}
                            onChangeText={setInput}
                            placeholder={`Ask about ${pageTitle.toLowerCase()}…`}
                            placeholderTextColor={vars.tertiaryTextColor}
                            keyboardAppearance={appearance}
                            style={[styles.input, { color: vars.textColor }]}
                            multiline
                            maxLength={1000}
                            editable={!sending}
                        />

                        <PressableScale
                            accessibilityRole="button"
                            accessibilityLabel="Send message"
                            onPress={send}
                            enabled={canSend}
                            style={[styles.send, { backgroundColor: vars.accentColor, opacity: canSend ? 1 : 0.35 }]}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <SendIcon size={16} color="#fff" />
                            )}
                        </PressableScale>
                    </LiquidGlassView>
                </View>
            </KeyboardAvoidingView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerOverlay: {
        position: "absolute",
        top: -40,
        left: 0,
        right: 0,
        height: 88,
        zIndex: 100,
        elevation: 100,
        overflow: "hidden",
    },
    headerBlur: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 48,
        paddingBottom: 10,
    },
    headerContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    icon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
    },
    titleGroup: {
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
    },
    context: {
        fontSize: 12,
        opacity: 0.55,
        marginTop: 1,
    },
    keyboard: {
        flex: 1,
        zIndex: 1,
    },
    messages: {
        gap: 10,
        paddingHorizontal: 16,
    },
    listHeaderSpacer: {
        height: 82,
    },
    listFooterSpacer: {
        height: 90,
    },
    message: {
        maxWidth: "85%",
        borderRadius: 18,
        paddingHorizontal: 13,
        paddingVertical: 10,
    },
    messageWrap: {
        maxWidth: "85%",
    },
    messageMine: {
        alignSelf: "flex-end",
    },
    messageTheirs: {
        alignSelf: "flex-start",
    },
    resend: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-end",
        gap: 4,
        marginTop: 4,
        paddingVertical: 4,
        paddingHorizontal: 2,
    },
    resendText: {
        fontSize: 12,
        fontWeight: "600",
    },
    errorText: {
        fontSize: 12,
        alignSelf: "flex-end",
        textAlign: "right",
        marginTop: 4,
        maxWidth: "85%",
    },
    messageText: {
        fontSize: 15,
        lineHeight: 21,
    },
    messageTextMine: {
        color: "#fff",
    },
    markdownList: {
        marginTop: 4,
        marginBottom: 4,
    },
    markdownListItem: {
        marginBottom: 4,
    },
    thinking: {
        alignSelf: "flex-start",
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 11,
        flexDirection: "row",
        gap: 8,
    },
    thinkingText: {
        fontSize: 13,
        opacity: 0.7,
    },
    composerOverlay: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 20,
        elevation: 20,
        paddingHorizontal: 16,
        paddingBottom: DOCK_BOTTOM,
    },
    glassInput: {
        minHeight: COMPOSER_MIN_HEIGHT,
        maxHeight: 120,
        borderRadius: BORDER_RADIUS_L,
        borderWidth: 1,
        paddingLeft: BAR_PADDING_H,
        paddingRight: 8,
        paddingVertical: 4,
        flexDirection: "row",
        alignItems: "flex-end",
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 2,
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 110,
        paddingVertical: 8,
        paddingHorizontal: 2,
        fontSize: BAR_FONT_SIZE,
        fontWeight: "400",
    },
    send: {
        width: COMPOSER_SEND_SIZE,
        height: COMPOSER_SEND_SIZE,
        borderRadius: COMPOSER_SEND_SIZE / 2,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
    },
})
