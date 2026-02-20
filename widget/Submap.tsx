import { createState, onCleanup } from "ags"
import Hyprland from "gi://AstalHyprland"

export default function Submap() {
  const hypr = Hyprland.get_default()
  const [submap, setSubmap] = createState("")

  // submap is a signal, not a property — connect manually
  const id = hypr.connect("submap", (_: unknown, name: string) => {
    setSubmap(name ?? "")
  })
  onCleanup(() => hypr.disconnect(id))

  return (
    <label
      class="submap bar-icon"
      label={submap}
      visible={submap.as((s) => s !== "")}
    />
  )
}
