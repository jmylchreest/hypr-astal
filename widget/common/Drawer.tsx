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
  transitionDuration = 200,
}: DrawerProps) {
  const [revealed, setRevealed] = createState(false)

  // GTK4 requires EventControllerMotion for hover detection
  const hover = new Gtk.EventControllerMotion()
  hover.connect("enter", () => setRevealed(true))
  hover.connect("leave", () => setRevealed(false))

  // Use CSS max-width animation instead of Gtk.Revealer.
  // Revealer leaves its child unallocated when closed, causing snapshot
  // warnings whenever the parent box redraws (e.g. on hover events).
  // With max-width + overflow:hidden the child is always allocated at its
  // natural size; the clip hides it, and the CSS transition animates it open.
  const drawerCss = revealed.as((open) =>
    open
      ? `max-width: 500px; opacity: 1;`
      : `max-width: 0px;    opacity: 0;`
  )

  const boxOrder =
    direction === "left"
      ? [
          <box
            class="drawer-child"
            valign={Gtk.Align.CENTER}
            overflow={Gtk.Overflow.HIDDEN}
            css={drawerCss}
          >
            {Array.isArray(children) ? children : [children]}
          </box>,
          trigger,
        ]
      : [
          trigger,
          <box
            class="drawer-child"
            valign={Gtk.Align.CENTER}
            overflow={Gtk.Overflow.HIDDEN}
            css={drawerCss}
          >
            {Array.isArray(children) ? children : [children]}
          </box>,
        ]

  return (
    <box
      class="pill-group"
      valign={Gtk.Align.CENTER}
      overflow={Gtk.Overflow.HIDDEN}
      $={(self: Gtk.Box) => self.add_controller(hover)}
    >
      {boxOrder}
    </box>
  )
}
