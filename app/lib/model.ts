import { httpRequest } from "./httpHelper"
import { TrainModelResponse } from "@/types/category-model"
import Toast from "react-native-toast-message"

const MODEL_PATH = "category-model/train"

const trainModel = async (): Promise<TrainModelResponse | null> => {
    try {
        const response = await httpRequest<TrainModelResponse>({
            url: MODEL_PATH,
            method: "POST",
        })

        return response.data
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error: Failed to train model",
        })
        return null
    }
}

export const modelClient = {
    trainModel,
}
