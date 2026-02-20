import { Astal, Gtk } from "ags/gtk4"

export type BarLayout = {
  anchor: number
  layer: Astal.Layer
  exclusivity: Astal.Exclusivity
  orientation: Gtk.Orientation
}
