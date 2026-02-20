import { Gtk } from "ags/gtk4"
import registry from "./registry"

type SlotProps = {
  widgets: string[]
  spacing?: number
}

export default function SlotRenderer({ widgets, spacing = 4 }: SlotProps) {
  return (
    <box
      spacing={spacing}
      valign={Gtk.Align.CENTER}
    >
      {widgets.map((name) => {
        const Widget = registry[name]
        if (!Widget) {
          console.warn(`[bar] unknown widget: "${name}"`)
          return null
        }
        return (
          <box class={`widget-${name}`} valign={Gtk.Align.CENTER}>
            <Widget />
          </box>
        )
      })}
    </box>
  )
}
