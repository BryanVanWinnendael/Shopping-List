import { memo, ReactNode } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    title: string
    description: string
    badge?: string
    selected: boolean
    disabled?: boolean
    onPress: () => void | Promise<void>
    children?: ReactNode
}

function ProviderOption({ title, description, badge, selected, disabled = false, onPress, children }: Props) {
    const { vars } = useThemes()

    const borderColor = selected ? vars.accentColor : disabled ? vars.borderColor : "transparent"

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled }}
            style={({ pressed }) => [
                styles.container,
                {
                    backgroundColor: vars.secondaryBackgroundColor,
                    borderColor,
                    opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
                },
            ]}
        >
            <View style={styles.content}>
                <View style={styles.textContainer}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: vars.textColor }]}>{title}</Text>

                        {!!badge && (
                            <View
                                style={[
                                    styles.badge,
                                    disabled
                                        ? {
                                              backgroundColor: vars.secondaryBackgroundColor,
                                              borderWidth: 1,
                                              borderColor: vars.borderColor,
                                          }
                                        : { backgroundColor: vars.accentColor },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.badgeText,
                                        { color: disabled ? vars.textColor : vars.secondaryBackgroundColor },
                                    ]}
                                >
                                    {badge}
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text style={[styles.description, { color: vars.textColor }]}>{description}</Text>

                    {disabled && (
                        <Text style={[styles.unavailableText, { color: vars.textColor }]}>
                            Not available on this device
                        </Text>
                    )}
                </View>

                {children}
            </View>
        </Pressable>
    )
}

export default memo(ProviderOption)

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderRadius: 18,
        padding: 16,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    textContainer: {
        flex: 1,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 5,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
    },
    description: {
        fontSize: 13,
        lineHeight: 19,
        opacity: 0.65,
    },
    unavailableText: {
        fontSize: 12,
        lineHeight: 17,
        marginTop: 7,
        opacity: 0.55,
        fontWeight: "500",
    },
    badge: {
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "600",
    },
})
