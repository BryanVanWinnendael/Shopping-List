import { httpRequest } from "./httpHelper"

const MODEL_PATH = "category-model/train"

export const trainModel = async (): Promise<boolean> => {
  try {
    await httpRequest<void>({
      url: MODEL_PATH,
      method: "POST",
    })

    return true
  } catch (error) {
    console.error("Error training model:", error)
    return false
  }
}
