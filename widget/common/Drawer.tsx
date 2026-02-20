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

  // visible=false set declaratively so it applies before the first frame,
  // preventing GTK from trying to snapshot an unallocated box.
  const content = (
    <box class="drawer-child" valign={Gtk.Align.CENTER} visible={false}>
      {Array.isArray(children) ? children : [children]}
    </box>
  ) as Gtk.Box

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
        // Show content when revealer opens; hide again once close animation finishes
        const id = self.connect("notify::child-revealed", () => {
          content.visible = self.childRevealed
        })
        // Also show immediately when reveal starts (before animation completes)
        const idReveal = self.connect("notify::reveal-child", () => {
          if (self.revealChild) content.visible = true
        })
        onCleanup(() => {
          self.disconnect(id)
          self.disconnect(idReveal)
        })
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
