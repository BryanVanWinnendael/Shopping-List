import { memo, useMemo, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { PressableScale } from "pressto"
import Accordion from "@/components/accordion"
import LogBodyModal from "@/components/logs/logBodyModal"
import useThemes from "@/hooks/themes/useThemes"
import { decompress } from "@/lib/logs"
import { BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"
import { Trace } from "@/types/generated/models/trace"
import { SpanNode } from "@/types/generated/models/span_node"
import { Log as LogType } from "@/types/generated/models/log"

type Props = {
    trace: Trace
}

type Event = {
    type: "request" | "response"
    span: SpanNode
    log: LogType
}

type SelectedBody = {
    title: string
    body: string
}

const COLORS = {
    request: "#3B82F6",
    success: "#22C55E",
    error: "#EF4444",
}

const getStatusColor = (log: LogType) => (log.error ? COLORS.error : COLORS.success)

function buildEvents(node: SpanNode): Event[] {
    const events: Event[] = []

    if (node.request) {
        events.push({ type: "request", span: node, log: node.request })
    }

    for (const child of node.children ?? []) {
        events.push(...buildEvents(child))
    }

    if (node.response) {
        events.push({ type: "response", span: node, log: node.response })
    }

    return events
}

type EventCardProps = {
    event: Event
    onOpenBody: (compressed: string, title: string) => void
}

function EventCard({ event, onOpenBody }: EventCardProps) {
    const { vars } = useThemes()
    const { type, span, log } = event

    const textColor = { color: vars.textColor }
    const isRequest = type === "request"

    return (
        <View style={[styles.event, { backgroundColor: vars.backgroundColor, borderColor: vars.secondaryBorderColor }]}>
            <Text style={[styles.eventType, { color: isRequest ? COLORS.request : getStatusColor(log) }]}>
                {isRequest ? "→ REQUEST" : "← RESPONSE"}
            </Text>

            <Text style={[styles.service, textColor]}>{span.service}</Text>

            {!!log.httpMethod && (
                <Text style={[styles.text, textColor]}>
                    {log.httpMethod} {log.path}
                </Text>
            )}

            {!!log.dateTime && <Text style={[styles.meta, textColor]}>{log.dateTime}</Text>}

            {!isRequest && (
                <Text style={[styles.responseStatus, { color: getStatusColor(log) }]}>
                    {log.statusCode} • {log.durationMs} ms
                </Text>
            )}

            {!!log.text && <Text style={[styles.text, textColor]}>{log.text}</Text>}

            {!!log.requestBodyCompressed && (
                <PressableScale onPress={() => onOpenBody(log.requestBodyCompressed!, "Request Body")}>
                    <Text style={styles.link}>View Request Body</Text>
                </PressableScale>
            )}

            {!!log.responseBodyCompressed && (
                <PressableScale onPress={() => onOpenBody(log.responseBodyCompressed!, "Response Body")}>
                    <Text style={styles.link}>View Response Body</Text>
                </PressableScale>
            )}
        </View>
    )
}

function Log({ trace }: Props) {
    const { vars } = useThemes()

    const [expanded, setExpanded] = useState(false)
    const [selected, setSelected] = useState<SelectedBody | null>(null)

    const events = useMemo(() => trace.roots.flatMap(buildEvents), [trace])

    const rootRequest = events.find((e) => e.type === "request")?.log
    const rootResponse = events.findLast((e) => e.type === "response")?.log

    const openBody = (compressed: string, title: string) => {
        const body = decompress(compressed)

        if (body) setSelected({ title, body })
    }

    return (
        <>
            <View
                style={[
                    styles.card,
                    { backgroundColor: vars.secondaryBackgroundColor, borderColor: vars.secondaryBorderColor },
                ]}
            >
                <PressableScale onPress={() => setExpanded((value) => !value)}>
                    <Text style={[styles.title, { color: vars.textColor }]}>
                        {rootRequest?.httpMethod ?? "TRACE"} {rootRequest?.path ?? ""}
                    </Text>

                    {!!rootRequest?.dateTime && (
                        <Text style={[styles.subtitle, { color: vars.textColor }]}>{rootRequest.dateTime}</Text>
                    )}

                    {rootResponse && (
                        <Text style={[styles.status, { color: getStatusColor(rootResponse) }]}>
                            {rootResponse.statusCode} • {rootResponse.durationMs} ms
                        </Text>
                    )}
                </PressableScale>

                <Accordion expanded={expanded}>
                    <View style={styles.events}>
                        {events.map((event, index) => (
                            <EventCard
                                key={`${event.span.spanId}-${event.type}-${index}`}
                                event={event}
                                onOpenBody={openBody}
                            />
                        ))}
                    </View>
                </Accordion>
            </View>

            <LogBodyModal
                body={selected?.body ?? null}
                title={selected?.title ?? "Body"}
                onClose={() => setSelected(null)}
            />
        </>
    )
}

export default memo(Log)

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: BORDER_RADIUS_L,
        padding: 16,
        marginVertical: 6,
    },
    events: {
        marginTop: 16,
    },
    event: {
        borderWidth: 1,
        borderRadius: BORDER_RADIUS_M,
        padding: 12,
        marginBottom: 10,
    },
    eventType: {
        fontWeight: "700",
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
    responseStatus: {
        marginTop: 4,
    },
    link: {
        color: COLORS.request,
        marginTop: 10,
        fontWeight: "600",
        fontSize: 14,
    },
})
