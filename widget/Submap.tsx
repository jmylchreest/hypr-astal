import { createBinding } from "ags"
import Hyprland from "gi://AstalHyprland"

export default function Submap() {
  const hypr = Hyprland.get_default()
  const submap = createBinding(hypr, "submap")

  return (
    <label
      class="submap bar-icon"
      label={submap}
      visible={submap((s) => s !== "" && s !== null)}
    />
  )
}
