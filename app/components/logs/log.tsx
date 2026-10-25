import { memo, useMemo, useState } from "react"
import { Platform, StyleSheet, Text, View } from "react-native"
import { PressableScale } from "pressto"
import Accordion from "@/components/accordion"
import LogBodyModal from "@/components/logs/logBodyModal"
import useThemes from "@/hooks/themes/useThemes"
import { decompress } from "@/lib/logs"
import { ChevronDown, ChevronUp } from "lucide-react-native"
import { BORDER_RADIUS_FULL, BORDER_RADIUS_L, BORDER_RADIUS_M } from "@/lib/theme"
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
    warning: "#F59E0B",
}

const MONO_FONT = Platform.OS === "ios" ? "Menlo" : "monospace"

const METHOD_COLORS: Record<string, string> = {
    GET: COLORS.request,
    POST: COLORS.success,
    PUT: COLORS.warning,
    PATCH: COLORS.warning,
    DELETE: COLORS.error,
}

const getMethodColor = (method?: string | null) =>
    method ? (METHOD_COLORS[method.toUpperCase()] ?? COLORS.request) : COLORS.request

const getStatusColor = (log: LogType) => (log.error ? COLORS.error : COLORS.success)

const formatDuration = (ms?: number | null) => {
    if (ms == null) return ""
    if (ms < 1000) return `${Math.round(ms)} ms`
    return `${(ms / 1000).toFixed(1)} s`
}

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
    const accent = isRequest ? COLORS.request : getStatusColor(log)

    return (
        <View style={[styles.event, { backgroundColor: vars.backgroundColor, borderColor: vars.secondaryBorderColor }]}>
            <View style={styles.eventHeader}>
                <View style={[styles.dot, { backgroundColor: accent }]} />
                <Text style={[styles.service, textColor]} numberOfLines={1}>
                    {span.service}
                </Text>
                <Text style={[styles.eventType, { color: accent }]}>{isRequest ? "REQ" : "RES"}</Text>
            </View>

            {!!log.httpMethod && (
                <View style={styles.methodRow}>
                    <View style={[styles.methodBadge, { backgroundColor: `${getMethodColor(log.httpMethod)}26` }]}>
                        <Text style={[styles.methodText, { color: getMethodColor(log.httpMethod) }]}>
                            {log.httpMethod}
                        </Text>
                    </View>
                    <Text style={[styles.path, textColor]} numberOfLines={1}>
                        {log.path}
                    </Text>
                </View>
            )}

            {!isRequest && (log.statusCode != null || log.durationMs != null) && (
                <View style={styles.pills}>
                    {log.statusCode != null && (
                        <View style={[styles.pill, { backgroundColor: `${getStatusColor(log)}26` }]}>
                            <Text style={[styles.pillText, { color: getStatusColor(log) }]}>{log.statusCode}</Text>
                        </View>
                    )}
                    {log.durationMs != null && (
                        <View style={[styles.pill, { backgroundColor: vars.secondaryBackgroundColor }]}>
                            <Text style={[styles.pillText, { color: vars.secondaryTextColor }]}>
                                {formatDuration(log.durationMs)}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {!!log.dateTime && <Text style={[styles.meta, { color: vars.secondaryTextColor }]}>{log.dateTime}</Text>}

            {!!log.text && <Text style={[styles.text, textColor]}>{log.text}</Text>}

            {!!log.requestBodyCompressed && (
                <PressableScale
                    onPress={() => onOpenBody(log.requestBodyCompressed!, "Request Body")}
                    style={[styles.bodyButton, { borderColor: vars.secondaryBorderColor }]}
                >
                    <Text style={[styles.bodyButtonText, { color: COLORS.request }]}>View request body</Text>
                </PressableScale>
            )}

            {!!log.responseBodyCompressed && (
                <PressableScale
                    onPress={() => onOpenBody(log.responseBodyCompressed!, "Response Body")}
                    style={[styles.bodyButton, { borderColor: vars.secondaryBorderColor }]}
                >
                    <Text style={[styles.bodyButtonText, { color: COLORS.request }]}>View response body</Text>
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
    const hasError = events.some((e) => e.log.error)

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
                    <View style={styles.header}>
                        <View style={styles.headerText}>
                            {!!rootRequest?.httpMethod && (
                                <View
                                    style={[
                                        styles.methodBadge,
                                        { backgroundColor: `${getMethodColor(rootRequest.httpMethod)}26` },
                                    ]}
                                >
                                    <Text
                                        style={[styles.methodText, { color: getMethodColor(rootRequest.httpMethod) }]}
                                    >
                                        {rootRequest.httpMethod}
                                    </Text>
                                </View>
                            )}
                            <Text style={[styles.title, { color: vars.textColor }]} numberOfLines={1}>
                                {rootRequest?.path ?? "TRACE"}
                            </Text>
                        </View>
                        <View style={styles.headerSide}>
                            {hasError && <View style={[styles.dot, { backgroundColor: COLORS.error }]} />}
                            {expanded ? (
                                <ChevronUp size={20} color={vars.textColor} />
                            ) : (
                                <ChevronDown size={20} color={vars.textColor} />
                            )}
                        </View>
                    </View>

                    <View style={styles.subHeader}>
                        {!!rootRequest?.dateTime && (
                            <Text style={[styles.subtitle, { color: vars.secondaryTextColor }]} numberOfLines={1}>
                                {rootRequest.dateTime}
                            </Text>
                        )}
                        {rootResponse && (
                            <Text style={[styles.status, { color: getStatusColor(rootResponse) }]}>
                                {rootResponse.statusCode} • {formatDuration(rootResponse.durationMs)}
                            </Text>
                        )}
                    </View>
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
        padding: 14,
        marginVertical: 6,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerText: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        minWidth: 0,
    },
    headerSide: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    subHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        marginTop: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    events: {
        marginTop: 14,
        gap: 10,
    },
    event: {
        borderWidth: 1,
        borderRadius: BORDER_RADIUS_M,
        padding: 12,
    },
    eventHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    eventType: {
        fontWeight: "700",
        fontSize: 11,
        letterSpacing: 1,
    },
    methodRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 8,
        minWidth: 0,
    },
    methodBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS_FULL,
    },
    methodText: {
        fontFamily: MONO_FONT,
        fontWeight: "700",
        fontSize: 11,
        letterSpacing: 0.5,
    },
    path: {
        flex: 1,
        fontFamily: MONO_FONT,
        fontSize: 13,
        minWidth: 0,
    },
    title: {
        flex: 1,
        fontFamily: MONO_FONT,
        fontSize: 14,
        fontWeight: "600",
        minWidth: 0,
    },
    subtitle: {
        fontSize: 12,
        flex: 1,
        minWidth: 0,
    },
    status: {
        fontWeight: "600",
        fontSize: 13,
        fontFamily: MONO_FONT,
    },
    service: {
        flex: 1,
        fontWeight: "600",
        fontSize: 14,
        minWidth: 0,
    },
    text: {
        marginTop: 6,
        fontSize: 14,
        lineHeight: 20,
    },
    meta: {
        marginTop: 4,
        fontSize: 12,
    },
    pills: {
        flexDirection: "row",
        gap: 6,
        marginTop: 8,
    },
    pill: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: BORDER_RADIUS_FULL,
    },
    pillText: {
        fontFamily: MONO_FONT,
        fontWeight: "700",
        fontSize: 11,
    },
    bodyButton: {
        marginTop: 10,
        borderWidth: 1,
        borderRadius: BORDER_RADIUS_FULL,
        paddingVertical: 7,
        paddingHorizontal: 12,
        alignSelf: "flex-start",
    },
    bodyButtonText: {
        fontWeight: "600",
        fontSize: 13,
    },
})
