import { Astal, Gtk } from "ags/gtk4"

export type BarLayout = {
  anchor: number
  layer: Astal.Layer
  exclusivity: Astal.Exclusivity
  orientation: Gtk.Orientation
  // Derived from anchor + orientation for widget popovers
  popoverPosition: Gtk.PositionType
  // Direction drawers should expand (opposite side from trigger)
  drawerDirection: "left" | "right"
}
