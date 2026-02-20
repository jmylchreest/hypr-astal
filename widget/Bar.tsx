import layout from "../layouts"
import { getConfig } from "../config.loader"
import SlotRenderer from "./SlotRenderer"

const config = getConfig()

export default function Bar(monitor = 0) {
  return (
    <window
      visible
      class="Bar"
      monitor={monitor}
      anchor={layout.anchor}
      exclusivity={layout.exclusivity}
      layer={layout.layer}
    >
      <centerbox orientation={layout.orientation}>
        <SlotRenderer $type="start" widgets={config.start} />
        <SlotRenderer widgets={config.centre} />
        <SlotRenderer $type="end" widgets={config.end} />
      </centerbox>
    </window>
  )
}
