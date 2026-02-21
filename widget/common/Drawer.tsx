import { createState, onCleanup } from "ags"
import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib"

// Fade duration in ms — must match the CSS transition duration in .drawer-child
const FADE_MS = 120

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

  let contentWidget: Gtk.Box | null = null
  let hideTimer: number | null = null

  function show() {
    if (hideTimer !== null) {
      GLib.source_remove(hideTimer)
      hideTimer = null
    }
    if (contentWidget) {
      contentWidget.remove_css_class("hidden")
    }
    setRevealed(true)
  }

  function hide() {
    // Apply opacity-0 class immediately, then hide widget after transition
    if (contentWidget) {
      contentWidget.add_css_class("hidden")
    }
    hideTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, FADE_MS, () => {
      hideTimer = null
      setRevealed(false)
      return GLib.SOURCE_REMOVE
    })
  }

  const hover = new Gtk.EventControllerMotion()
  hover.connect("enter", show)
  hover.connect("leave", hide)

  // No Gtk.Revealer — it causes persistent "snapshot without allocation"
  // GTK warnings that cannot be suppressed. Opacity fade + visible toggle instead.
  const content = (
    <box
      class="drawer-child hidden"
      valign={Gtk.Align.CENTER}
      vexpand={false}
      visible={revealed}
      $={(self: Gtk.Box) => { contentWidget = self }}
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
        onCleanup(() => {
          self.remove_controller(hover)
          if (hideTimer !== null) {
            GLib.source_remove(hideTimer)
            hideTimer = null
          }
        })
      }}
    >
      {direction === "left" ? [content, trigger] : [trigger, content]}
    </box>
  )
}
