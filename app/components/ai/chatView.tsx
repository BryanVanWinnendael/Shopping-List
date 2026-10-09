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
import { SendIcon } from "lucide-react-native"
import { BlurView } from "expo-blur"
import LiquidGlassView from "@/components/native/liquidGlassView"
import { PressableScale } from "pressto"
import Markdown from "react-native-markdown-display"
import useThemes from "@/hooks/themes/useThemes"
import { getAiContext } from "@/lib/ai/context"
import { chat } from "@/lib/ai/chat"
import { loadLocalModel } from "@/lib/ai/settings"
import { BORDER_RADIUS_L, COMPOSER_MIN_HEIGHT, COMPOSER_SEND_SIZE, DOCK_BOTTOM } from "@/lib/theme"
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
}

const PAGE_TITLES: Record<string, string> = {
    "/": "Shopping List",
    "/recipes": "Recipes",
    "/online-recipes": "Online Recipes",
    "/searchProducts": "Search Products",
    "/weekly": "Weekly List",
    "/weeklyCategories": "Weekly Categories",
    "/logs": "Logs",
    "/settings": "Settings",
}

const RECIPE_DETAIL_REGEX = /^\/recipes\/[^/]+$/

const PROVIDER_LABELS: Record<AIProvider, string> = {
    cloud: "Cloud AI",
    "built-in": "Built-in AI",
    downloaded: "Downloaded model",
    disabled: "AI",
}

const SEND_ICON_PATH =
    "M18.455 9.8834L7.063 4.1434C6.76535 3.96928 6.40109 3.95274 6.08888 4.09916C5.77667 4.24558 5.55647 4.53621 5.5 4.8764C5.5039 4.98942 5.53114 5.10041 5.58 5.2024L7.749 10.4424C7.85786 10.7903 7.91711 11.1519 7.925 11.5164C7.91714 11.8809 7.85789 12.2425 7.749 12.5904L5.58 17.8304C5.53114 17.9324 5.5039 18.0434 5.5 18.1564C5.55687 18.4961 5.77667 18.7862 6.0889 18.9323C6.40078 19.0785 6.76456 19.062 7.062 18.8884L18.455 13.1484C19.0903 12.8533 19.4967 12.2164 19.4967 11.5159C19.4967 10.8154 19.0903 10.1785 18.455 9.8834Z"

function getPageTitle(pathname: string, recipeTitle?: string) {
    if (RECIPE_DETAIL_REGEX.test(pathname)) {
        return recipeTitle || "Recipe details"
    }

    if (pathname === "/online-recipes/details") {
        return "Online recipe details"
    }

    return PAGE_TITLES[pathname] ?? "Current page"
}

const MessageBubble = memo(function MessageBubble({ message }: { message: Message }) {
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

    const listRef = useRef<FlatList<Message>>(null)
    const idCounter = useRef(0)

    const pageTitle = useMemo(() => getPageTitle(pathname, recipeTitle), [pathname, recipeTitle])
    const canSend = !!input.trim() && !sending

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

    // Scroll to the newest message, and to the "Thinking…" indicator when it appears.
    useEffect(() => {
        if (!messages.length) return

        requestAnimationFrame(() => {
            listRef.current?.scrollToEnd({ animated: true })
        })
    }, [messages.length, sending])

    const send = async () => {
        const content = input.trim()

        if (!content || sending) return

        const userMessage: Message = { id: createId("user"), role: "user", content }

        setInput("")
        setMessages((current) => [...current, userMessage])
        setSending(true)
        setDownloadProgress(null)

        // Read the context when the user sends, so it contains the latest app data.
        const context = getAiContext(pathname)

        try {
            // The downloaded model isn't in memory after an app restart. This loads it once and is a no-op afterwards.
            if (provider === "downloaded") {
                await loadLocalModel()
            }

            const reply = await chat({
                page: pageTitle,
                pathname,
                messages: [...messages, userMessage],
                context,
                provider,
                onDownloadProgress: setDownloadProgress,
            })

            setMessages((current) => [
                ...current,
                { id: createId("assistant"), role: "assistant", content: reply || "I couldn't generate a response." },
            ])
        } catch (error) {
            console.error("AI chat failed:", error)

            setMessages((current) => [
                ...current,
                {
                    id: createId("error"),
                    role: "assistant",
                    content: "I couldn't generate a response. Please try again.",
                },
            ])
        } finally {
            setSending(false)
            setDownloadProgress(null)
        }
    }

    const renderItem = useCallback(({ item }: { item: Message }) => <MessageBubble message={item} />, [])

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
                                            ? "Thinking…"
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
    messageMine: {
        alignSelf: "flex-end",
    },
    messageTheirs: {
        alignSelf: "flex-start",
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
        paddingLeft: 16,
        paddingRight: 6,
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
        minHeight: 34,
        maxHeight: 100,
        paddingVertical: 7,
        paddingHorizontal: 2,
        fontSize: 16,
        fontWeight: "400",
    },
    send: {
        width: COMPOSER_SEND_SIZE,
        height: COMPOSER_SEND_SIZE,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 6,
    },
})
