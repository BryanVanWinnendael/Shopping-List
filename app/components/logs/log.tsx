import { useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import Accordion from "@/components/accordion"
import useThemes from "@/hooks/themes/useThemes"
import { decompress } from "@/lib/logs"
import LogBodyModal from "@/components/logs/logBodyModal"
import { Trace } from "@/types/generated/models/trace"
import { SpanNode } from "@/types/generated/models/span_node"
import { Log } from "@/types/generated/models/log"

type Props = {
    trace: Trace
}

type Event =
    | {
          type: "request"
          span: SpanNode
          log: Log
      }
    | {
          type: "response"
          span: SpanNode
          log: Log
      }

function buildEvents(node: SpanNode): Event[] {
    const events: Event[] = []

    if (node.request) {
        events.push({
            type: "request",
            span: node,
            log: node.request,
        })
    }

    for (const child of node.children ?? []) {
        events.push(...buildEvents(child))
    }

    if (node.response) {
        events.push({
            type: "response",
            span: node,
            log: node.response,
        })
    }

    return events
}

export default function Log({ trace }: Props) {
    const { vars } = useThemes()

    const [expanded, setExpanded] = useState(false)
    const [selectedBody, setSelectedBody] = useState<string | null>(null)
    const [selectedTitle, setSelectedTitle] = useState("Body")

    const events = useMemo(() => {
        return trace.roots.flatMap(buildEvents)
    }, [trace])

    const rootRequest = events.find((e) => e.type === "request")?.log
    const rootResponse = [...events].reverse().find((e) => e.type === "response")?.log

    function openBody(compressed?: string | null, title: string = "Body") {
        if (!compressed) return

        const body = decompress(compressed)

        if (!body) return

        setSelectedTitle(title)
        setSelectedBody(body)
    }

    return (
        <>
            <View
                style={[
                    styles.card,
                    {
                        backgroundColor: vars.secondaryBackgroundColor,
                        borderColor: vars.secondaryBorderColor,
                    },
                ]}
            >
                <Pressable onPress={() => setExpanded((v) => !v)}>
                    <Text
                        style={[
                            styles.title,
                            {
                                color: vars.textColor,
                            },
                        ]}
                    >
                        {rootRequest?.httpMethod ?? "TRACE"} {rootRequest?.path ?? ""}
                    </Text>

                    {!!rootRequest?.dateTime && (
                        <Text
                            style={[
                                styles.subtitle,
                                {
                                    color: vars.textColor,
                                },
                            ]}
                        >
                            {rootRequest.dateTime}
                        </Text>
                    )}

                    {rootResponse && (
                        <Text
                            style={[
                                styles.status,
                                {
                                    color: rootResponse.error ? "#EF4444" : "#22C55E",
                                },
                            ]}
                        >
                            {rootResponse.statusCode} • {rootResponse.durationMs} ms
                        </Text>
                    )}
                </Pressable>

                <Accordion expanded={expanded}>
                    <View style={{ marginTop: 16 }}>
                        {events.map((event, index) => {
                            const { span, log } = event

                            return (
                                <View
                                    key={`${span.spanId}-${index}`}
                                    style={[
                                        styles.event,
                                        {
                                            backgroundColor: vars.backgroundColor,
                                            borderColor: vars.secondaryBorderColor,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={{
                                            color:
                                                event.type === "request"
                                                    ? "#3B82F6"
                                                    : log.error
                                                      ? "#EF4444"
                                                      : "#22C55E",
                                            fontWeight: "700",
                                        }}
                                    >
                                        {event.type === "request" ? "→ REQUEST" : "← RESPONSE"}
                                    </Text>

                                    <Text
                                        style={[
                                            styles.service,
                                            {
                                                color: vars.textColor,
                                            },
                                        ]}
                                    >
                                        {span.service}
                                    </Text>

                                    {log.httpMethod && (
                                        <Text
                                            style={[
                                                styles.text,
                                                {
                                                    color: vars.textColor,
                                                },
                                            ]}
                                        >
                                            {log.httpMethod} {log.path}
                                        </Text>
                                    )}

                                    {!!log.dateTime && (
                                        <Text
                                            style={[
                                                styles.meta,
                                                {
                                                    color: vars.textColor,
                                                },
                                            ]}
                                        >
                                            {log.dateTime}
                                        </Text>
                                    )}

                                    {event.type === "response" && (
                                        <Text
                                            style={{
                                                color: log.error ? "#EF4444" : "#22C55E",
                                                marginTop: 4,
                                            }}
                                        >
                                            {log.statusCode} • {log.durationMs} ms
                                        </Text>
                                    )}

                                    {!!log.text && (
                                        <Text
                                            style={[
                                                styles.text,
                                                {
                                                    color: vars.textColor,
                                                },
                                            ]}
                                        >
                                            {log.text}
                                        </Text>
                                    )}

                                    {log.requestBodyCompressed && (
                                        <Pressable onPress={() => openBody(log.requestBodyCompressed, "Request Body")}>
                                            <Text style={styles.link}>View Request Body</Text>
                                        </Pressable>
                                    )}

                                    {log.responseBodyCompressed && (
                                        <Pressable
                                            onPress={() => openBody(log.responseBodyCompressed, "Response Body")}
                                        >
                                            <Text style={styles.link}>View Response Body</Text>
                                        </Pressable>
                                    )}
                                </View>
                            )
                        })}
                    </View>
                </Accordion>
            </View>

            <LogBodyModal body={selectedBody} title={selectedTitle} onClose={() => setSelectedBody(null)} />
        </>
    )
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: 20,
        padding: 16,
        marginVertical: 6,
    },
    event: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
    },
    subtitle: {
        opacity: 0.7,
        marginTop: 4,
        fontSize: 13,
    },
    status: {
        marginTop: 8,
        fontWeight: "600",
        fontSize: 14,
    },
    service: {
        fontWeight: "600",
        marginTop: 8,
        fontSize: 15,
    },
    text: {
        marginTop: 6,
        fontSize: 14,
        lineHeight: 20,
    },
    meta: {
        opacity: 0.7,
        marginTop: 2,
        fontSize: 12,
    },
    link: {
        color: "#3B82F6",
        marginTop: 10,
        fontWeight: "600",
        fontSize: 14,
    },
})
