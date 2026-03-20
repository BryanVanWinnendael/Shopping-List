import { Actions } from "@/types"
import { getUser } from "./user"
import { httpRequest } from "./httpHelper"

const LOGS_PATH = "logs/app"

const formatDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }
  const timeString = date.toLocaleTimeString([], options)
  const dateString = date.toLocaleDateString()
  return `${timeString} ${dateString}`
}

export const createLogs = async (
  action: Actions,
  item: string,
  error: boolean = false,
): Promise<void> => {
  try {
    const time = formatDate(new Date())
    const user = await getUser()
    const itemText = item.length === 0 ? "IMAGE" : item
    const text = `${error}, ${time}, ${action}, ${itemText}, ${user}`

    await httpRequest<void, { text: string }>({
      url: LOGS_PATH,
      method: "POST",
      body: { text },
    })
  } catch (error) {
    console.error("Error creating logs:", error)
  }
}

export const getLogs = async (): Promise<string[] | undefined> => {
  try {
    const response = await httpRequest<{ logs: string[] }>({
      url: LOGS_PATH,
      method: "GET",
    })

    return response.data.logs
  } catch (error) {
    console.error("Error fetching logs:", error)
    return undefined
  }
}

export const clearLogs = async (): Promise<void> => {
  try {
    await httpRequest<void>({
      url: LOGS_PATH,
      method: "DELETE",
    })
  } catch (error) {
    console.error("Error clearing logs:", error)
  }
}
