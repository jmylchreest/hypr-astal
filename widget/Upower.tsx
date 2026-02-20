import { createPoll } from "ags/time"
import { createComputed } from "ags"

const ICONS = {
  battery:     ["", "", "", "", ""],
  charging:    "󰂄",
  unavailable: "",
}

export default function Upower() {
  const raw = createPoll("", 5000, 
    "sh -c 'upower -e | grep -i battery | head -1 | xargs -I{} upower -i {} 2>/dev/null || echo \"\"'"
  )

  const info = createComputed(() => {
    const text = raw()
    if (!text) return { icon: ICONS.unavailable, tooltip: "", visible: false }

    const percentMatch = text.match(/percentage:\s*(\d+)%/)
    const stateMatch = text.match(/state:\s*(\w+)/)
    const timeMatch = text.match(/time to (?:full|empty):\s*(.+)/)

    const percent = percentMatch ? parseInt(percentMatch[1]) : 0
    const state = stateMatch ? stateMatch[1] : "unknown"
    const time = timeMatch ? timeMatch[1] : ""

    const iconIndex = Math.min(4, Math.floor(percent / 20))
    const icon = state === "charging" 
      ? ICONS.charging 
      : ICONS.battery[iconIndex]

    return {
      icon,
      tooltip: `${percent}%${time ? ` // ${time}` : ""} (${state})`,
      visible: percent > 0 || state !== "unknown",
    }
  })

  return (
    <label
      class="bar-icon"
      label={info((i) => i.icon)}
      tooltipText={info((i) => i.tooltip)}
      visible={info((i) => i.visible)}
    />
  )
}
