import { Gtk } from "ags/gtk4"
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
      heightRequest={44}
    >
      <centerbox
        orientation={layout.orientation}
        hexpand
        vexpand={false}
        valign={Gtk.Align.CENTER}
      >
        <SlotRenderer $type="start" widgets={config.start} />
        <SlotRenderer widgets={config.centre} />
        <SlotRenderer $type="end" widgets={config.end} />
      </centerbox>
    </window>
  )
}
