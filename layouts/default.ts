import { Astal, Gtk } from "ags/gtk4"
import type { BarLayout } from "./types"

const layout: BarLayout = {
  anchor: Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT,
  layer: Astal.Layer.TOP,
  exclusivity: Astal.Exclusivity.EXCLUSIVE,
  orientation: Gtk.Orientation.HORIZONTAL,
  // Top horizontal bar: popovers open downward, drawers expand left
  popoverPosition: Gtk.PositionType.BOTTOM,
  drawerDirection: "left",
}

export default layout
