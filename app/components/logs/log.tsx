import { Action, Log as LogType } from "@/types/logs"
import { ACTION_COLORS } from "@/lib/constants"
import { StyleSheet, Text, View } from "react-native"
import useThemes from "@/hooks/themes/useThemes"

type Props = {
    log: LogType
}

export default function Log({ log }: Props) {
    const { vars } = useThemes()

    const isError = log.error
    const actionColor = ACTION_COLORS[log.action.trim().toLowerCase() as Action] || vars.textColor

    return (
        <View
            style={[
                styles.logItem,
                {
                    backgroundColor: vars.secondaryBackgroundColor,
                    borderColor: vars.secondaryBorderColor,
                    borderWidth: 1,
                },
            ]}
        >
            {isError && <Text style={{ color: "#EF4444", fontWeight: "bold" }}>Error:</Text>}
            <Text style={{ color: isError ? "#EF4444" : vars.textColor }}>{log.date.trim()}</Text>
            <Text style={{ color: actionColor, textTransform: "uppercase" }}>{log.action.trim()}</Text>
            <Text style={{ color: vars.textColor }}>{`\`${log.text.trim()}\``}</Text>
            <Text style={{ color: vars.textColor }}>{`by ${log.user.trim()}`}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    logItem: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 8,
        paddingVertical: 16,
        paddingHorizontal: 8,
        width: "100%",
        borderRadius: 20,
        marginVertical: 4,
    },
})
