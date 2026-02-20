import { createState } from "ags"
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
  transitionDuration = 500,
}: DrawerProps) {
  const [revealed, setRevealed] = createState(false)

  const transitionType =
    direction === "left"
      ? Gtk.RevealerTransitionType.SLIDE_RIGHT
      : Gtk.RevealerTransitionType.SLIDE_LEFT

  // GTK4 requires EventControllerMotion for hover detection
  const hover = new Gtk.EventControllerMotion()
  hover.connect("enter", () => setRevealed(true))
  hover.connect("leave", () => setRevealed(false))

  return (
    <box
      class="pill-group"
      $={(self: Gtk.Box) => self.add_controller(hover)}
    >
      <revealer
        revealChild={revealed}
        transitionType={transitionType}
        transitionDuration={transitionDuration}
      >
        <box class="drawer-child">
          {Array.isArray(children) ? children : [children]}
        </box>
      </revealer>
      {trigger}
    </box>
  )
}
