import { createState, onCleanup } from "ags"
import { Gtk } from "ags/gtk4"

type DrawerProps = {
  trigger: JSX.Element
  children: JSX.Element | JSX.Element[]
  direction?: "left" | "right"
  transitionDuration?: number
}

export default function Drawer({
  trigger,
  children,
  direction = "left",
  transitionDuration = 300,
}: DrawerProps) {
  const [revealed, setRevealed] = createState(false)

  // GTK4 requires EventControllerMotion for hover detection
  const hover = new Gtk.EventControllerMotion()
  hover.connect("enter", () => setRevealed(true))
  hover.connect("leave", () => setRevealed(false))

  const content = (
    <box class="drawer-child" valign={Gtk.Align.CENTER}>
      {Array.isArray(children) ? children : [children]}
    </box>
  ) as Gtk.Box

  // Revealer handles the slide animation. To prevent "snapshot without
  // allocation" warnings we hide the content box when the revealer is
  // fully closed (child-revealed=false = animation finished closing).
  // This means the box has no size and GTK skips it in snapshot.
  const revealer = (
    <revealer
      revealChild={revealed}
      transitionType={
        direction === "left"
          ? Gtk.RevealerTransitionType.SLIDE_RIGHT
          : Gtk.RevealerTransitionType.SLIDE_LEFT
      }
      transitionDuration={transitionDuration}
      overflow={Gtk.Overflow.HIDDEN}
      valign={Gtk.Align.CENTER}
      vexpand={false}
      $={(self: Gtk.Revealer) => {
        const id = self.connect("notify::child-revealed", () => {
          content.visible = self.childRevealed
        })
        content.visible = false
        onCleanup(() => self.disconnect(id))
      }}
    >
      {content}
    </revealer>
  )

  return (
    <box
      class="pill-group"
      valign={Gtk.Align.CENTER}
      vexpand={false}
      $={(self: Gtk.Box) => self.add_controller(hover)}
    >
      {direction === "left" ? [revealer, trigger] : [trigger, revealer]}
    </box>
  )
}
