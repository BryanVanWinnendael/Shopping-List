import { useHeaderHeight } from "@react-navigation/elements"
import { PressableScale } from "pressto"
import { useEffect, useState, useCallback } from "react"
import { FlatList, Text, View, StyleSheet } from "react-native"
import { clearLogs, getLogs } from "@/lib/logs"
import {
  getBackgroundColor,
  getSecondaryBackgroundColor,
  getTextColor,
} from "@/lib/theme"
import { useSettings } from "@/stores/useSettings"
import { Actions } from "@/types"

const ACTION_COLORS: Record<Actions, string> = {
  add: "#3B82F6",
  delete: "#EF4444",
  get: "#22C55E",
  update: "#F59E0B",
}

export default function Logs() {
  const { theme, aColor } = useSettings()
  const headerHeight = useHeaderHeight()

  const [logs, setLogs] = useState<string[][]>([])

  const backgroundColor = getBackgroundColor(theme)
  const textColor = getTextColor(theme)

  const handleFetchLogs = useCallback(async () => {
    const fetchedLogs = await getLogs()
    const parsedLogs = fetchedLogs?.map((log: string) => log.split(",")) || []
    setLogs(parsedLogs.reverse())
  }, [])

  const handleClearLogs = async () => {
    await clearLogs()
    await handleFetchLogs()
  }

  useEffect(() => {
    handleFetchLogs()
  }, [])

  const renderItem = ({ log }: { log: string[] }) => {
    const isError = log[0] === "true"
    const actionColor = ACTION_COLORS[log[2].trim() as Actions] || textColor

    return (
      <View
        style={[
          styles.logItem,
          { backgroundColor: getSecondaryBackgroundColor(theme) },
        ]}
      >
        {isError && (
          <Text style={{ color: "#EF4444", fontWeight: "bold" }}>Error:</Text>
        )}
        <Text style={{ color: isError ? "#EF4444" : textColor }}>
          {log[1].trim()}
        </Text>
        <Text style={{ color: actionColor, textTransform: "uppercase" }}>
          {log[2].trim()}
        </Text>
        <Text style={{ color: textColor }}>{`\`${log[3].trim()}\``}</Text>
        <Text style={{ color: textColor }}>{`by ${log[4].trim()}`}</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.floatingButtons, { bottom: 30 }]}>
        <PressableScale
          style={[styles.button, { backgroundColor: aColor }]}
          onPress={handleClearLogs}
        >
          <Text style={styles.buttonText}>Clear</Text>
        </PressableScale>
        <PressableScale
          style={[styles.button, { backgroundColor: aColor }]}
          onPress={handleFetchLogs}
        >
          <Text style={styles.buttonText}>Fetch</Text>
        </PressableScale>
      </View>

      {logs.length > 0 ? (
        <FlatList
          contentContainerStyle={styles.flatListContent}
          data={logs}
          renderItem={({ item }) => renderItem({ log: item })}
          keyExtractor={(_, index) => String(index)}
          ListHeaderComponent={<View style={{ height: headerHeight }} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={{ color: textColor }}>No logs found.</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  floatingButtons: {
    position: "absolute",
    right: 15,
    flexDirection: "row",
    gap: 8,
    zIndex: 10,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  flatListContent: {
    marginHorizontal: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logItem: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
    paddingVertical: 16,
    paddingHorizontal: 8,
    width: "100%",
    borderRadius: 8,
    marginVertical: 4,
  },
})
