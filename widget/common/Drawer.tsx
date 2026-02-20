import { createState, onCleanup } from "ags"
import { Gtk } from "ags/gtk4"

type DrawerProps = {
  trigger: JSX.Element
  children: JSX.Element | JSX.Element[]
  direction?: "left" | "right"
}

export default function Drawer({
  trigger,
  children,
  direction = "left",
}: DrawerProps) {
  const [revealed, setRevealed] = createState(false)

  const hover = new Gtk.EventControllerMotion()
  hover.connect("enter", () => setRevealed(true))
  hover.connect("leave", () => setRevealed(false))

  // No Gtk.Revealer — it causes persistent "snapshot without allocation"
  // GTK warnings that cannot be suppressed. Simple show/hide instead.
  const content = (
    <box
      class="drawer-child"
      valign={Gtk.Align.CENTER}
      vexpand={false}
      visible={revealed}
    >
      {Array.isArray(children) ? children : [children]}
    </box>
  )

  return (
    <box
      class="pill-group"
      valign={Gtk.Align.CENTER}
      vexpand={false}
      $={(self: Gtk.Box) => {
        self.add_controller(hover)
        onCleanup(() => self.remove_controller(hover))
      }}
    >
      {direction === "left" ? [content, trigger] : [trigger, content]}
    </box>
  )
}
