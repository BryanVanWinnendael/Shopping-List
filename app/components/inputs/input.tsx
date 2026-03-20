import { useSettings } from "@/stores/useSettings"
import { ItemInput } from "./itemInput"
import { EditInput } from "./editInput"

export default function Input() {
  const { editItem } = useSettings()

  return <>{!editItem ? <ItemInput /> : <EditInput />}</>
}
