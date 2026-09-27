import useThemes from "@/hooks/themes/useThemes"
import { useGlobalSearchParams } from "expo-router"
import { Send, Sparkles } from "lucide-react-native"
import { useEffect, useMemo, useRef, useState } from "react"
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
import { BlurView } from "expo-blur"
import Markdown from "react-native-markdown-display"
import { getAiContext } from "@/lib/ai/context"
import { chat } from "@/lib/ai/chat"
import { GlassView } from "expo-glass-effect"
import { PressableScale } from "pressto"
import { AIProvider } from "@/types/ai"

type Props = {
    pathname: string
    provider: AIProvider
}

type Message = {
    id: string
    role: "assistant" | "user"
    content: string
}

const pageTitles: Record<string, string> = {
    "/": "Shopping List",
    "/recipes": "Recipes",
    "/online-recipes": "Online Recipes",
    "/searchProducts": "Search Products",
    "/weekly": "Weekly List",
    "/settings": "Settings",
}

function getPageTitle(pathname: string, recipeTitle?: string) {
    if (/^\/recipes\/[^/]+$/.test(pathname)) {
        return recipeTitle || "Recipe details"
    }

    if (pathname === "/online-recipes/details") {
        return "Online recipe details"
    }

    return pageTitles[pathname] ?? "Current page"
}

function getProviderLabel(provider: AIProvider) {
    switch (provider) {
        case "cloud":
            return "Cloud AI"
        case "built-in":
            return "Built-in AI"
        case "downloaded":
            return "Downloaded model"
        default:
            return "AI"
    }
}

export default function ChatView({ pathname, provider }: Props) {
    const { vars, appearance } = useThemes()

    const { title } = useGlobalSearchParams<{
        title?: string
    }>()

    const recipeTitle = Array.isArray(title) ? title[0] : title

    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [sending, setSending] = useState(false)
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null)

    const listRef = useRef<FlatList<Message>>(null)

    const pageTitle = useMemo(() => getPageTitle(pathname, recipeTitle), [pathname, recipeTitle])

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
        if (!messages.length) {
            return
        }

        requestAnimationFrame(() => {
            listRef.current?.scrollToEnd({
                animated: true,
            })
        })
    }, [messages.length])

    const send = async () => {
        const content = input.trim()

        if (!content || sending) {
            return
        }

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content,
        }

        setInput("")
        setMessages((current) => [...current, userMessage])
        setSending(true)
        setDownloadProgress(null)

        // Get the context at the moment the user sends
        // the message so it contains the latest app data.
        const context = getAiContext(pathname)

        try {
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
                {
                    id: `assistant-${Date.now()}`,
                    role: "assistant",
                    content: reply || "I couldn't generate a response.",
                },
            ])
        } catch (error) {
            console.error("AI chat failed:", error)

            setMessages((current) => [
                ...current,
                {
                    id: `error-${Date.now()}`,
                    role: "assistant",
                    content: "I couldn't generate a response. Please try again.",
                },
            ])
        } finally {
            setSending(false)
            setDownloadProgress(null)
        }
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerOverlay}>
                <BlurView intensity={10} tint={appearance} style={styles.headerBlur}>
                    <View style={styles.headerContent}>
                        <View
                            style={[
                                styles.icon,
                                {
                                    backgroundColor: `${vars.accentColor}20`,
                                },
                            ]}
                        >
                            <Sparkles color={vars.accentColor} size={18} />
                        </View>

                        <View style={styles.titleGroup}>
                            <Text
                                style={[
                                    styles.title,
                                    {
                                        color: vars.textColor,
                                    },
                                ]}
                            >
                                Assistant
                            </Text>

                            <Text
                                style={[
                                    styles.context,
                                    {
                                        color: vars.textColor,
                                    },
                                ]}
                                numberOfLines={1}
                            >
                                {getProviderLabel(provider)}
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
                {/* Messages */}
                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messages}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={<View style={styles.listHeaderSpacer} />}
                    ListFooterComponent={
                        <>
                            {sending ? (
                                <View
                                    style={[
                                        styles.thinking,
                                        {
                                            backgroundColor: vars.secondaryBackgroundColor,
                                        },
                                    ]}
                                >
                                    <ActivityIndicator color={vars.accentColor} size="small" />

                                    <Text
                                        style={[
                                            styles.thinkingText,
                                            {
                                                color: vars.textColor,
                                            },
                                        ]}
                                    >
                                        {downloadProgress === null
                                            ? "Thinking…"
                                            : `Downloading the offline model… ${downloadProgress}%`}
                                    </Text>
                                </View>
                            ) : null}

                            <View style={styles.listFooterSpacer} />
                        </>
                    }
                    renderItem={({ item }) => {
                        const mine = item.role === "user"

                        return (
                            <View
                                style={[
                                    styles.message,
                                    mine
                                        ? {
                                              alignSelf: "flex-end",
                                              backgroundColor: vars.accentColor,
                                          }
                                        : {
                                              alignSelf: "flex-start",
                                              backgroundColor: vars.secondaryBackgroundColor,
                                          },
                                ]}
                            >
                                {mine ? (
                                    <Text
                                        style={[
                                            styles.messageText,
                                            {
                                                color: "#fff",
                                            },
                                        ]}
                                    >
                                        {item.content}
                                    </Text>
                                ) : (
                                    <Markdown
                                        style={{
                                            body: {
                                                ...styles.messageText,
                                                color: vars.textColor,
                                            },
                                            strong: {
                                                fontWeight: "700",
                                                color: vars.textColor,
                                            },
                                            em: {
                                                fontStyle: "italic",
                                                color: vars.textColor,
                                            },
                                            bullet_list: {
                                                marginTop: 4,
                                                marginBottom: 4,
                                            },
                                            ordered_list: {
                                                marginTop: 4,
                                                marginBottom: 4,
                                            },
                                            list_item: {
                                                marginBottom: 4,
                                            },
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
                                            link: {
                                                color: vars.accentColor,
                                            },
                                        }}
                                    >
                                        {item.content}
                                    </Markdown>
                                )}
                            </View>
                        )
                    }}
                />

                {/* Composer */}
                <View style={styles.composerOverlay}>
                    <GlassView
                        style={styles.glassInput}
                        glassEffectStyle="regular"
                        isInteractive
                        colorScheme={appearance}
                    >
                        <TextInput
                            value={input}
                            onChangeText={setInput}
                            placeholder={`Ask about ${pageTitle.toLowerCase()}…`}
                            placeholderTextColor="#999"
                            keyboardAppearance={appearance}
                            style={[
                                styles.input,
                                {
                                    color: vars.textColor,
                                },
                            ]}
                            multiline
                            maxLength={1000}
                            editable={!sending}
                            onSubmitEditing={() => {
                                if (Platform.OS === "ios") {
                                    return
                                }

                                send()
                            }}
                        />

                        <PressableScale
                            accessibilityRole="button"
                            accessibilityLabel="Send message"
                            onPress={send}
                            enabled={!!input.trim() && !sending}
                            style={[
                                styles.send,
                                {
                                    backgroundColor: vars.accentColor,
                                    opacity: !input.trim() || sending ? 0.35 : 1,
                                },
                            ]}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Send color="#fff" size={17} />
                            )}
                        </PressableScale>
                    </GlassView>
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

    messageText: {
        fontSize: 15,
        lineHeight: 21,
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
        paddingBottom: 14,
    },

    glassInput: {
        minHeight: 56,
        maxHeight: 120,
        borderRadius: 28,
        paddingLeft: 16,
        paddingRight: 6,
        paddingVertical: 6,
        flexDirection: "row",
        alignItems: "flex-end",
        overflow: "hidden",
    },

    input: {
        flex: 1,
        minHeight: 42,
        maxHeight: 100,
        paddingVertical: 9,
        paddingHorizontal: 2,
        fontSize: 16,
        fontWeight: "400",
    },

    send: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 6,
    },
})
