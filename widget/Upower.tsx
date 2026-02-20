import { createBinding, createComputed } from "ags"
import Battery from "gi://AstalBattery"

const ICONS = {
  battery:  ["", "", "", "", ""],
  charging: "󰂄",
}

export default function Upower() {
  const bat = Battery.get_default()
  const percentage = createBinding(bat, "percentage")
  const charging = createBinding(bat, "charging")
  const timeToFull = createBinding(bat, "timeToFull")
  const timeToEmpty = createBinding(bat, "timeToEmpty")
  const state = createBinding(bat, "state")

  const icon = createComputed(() => {
    if (charging()) return ICONS.charging
    const p = percentage() * 100
    const idx = Math.min(4, Math.floor(p / 20))
    return ICONS.battery[idx]
  })

  const tooltip = createComputed(() => {
    const p = Math.round(percentage() * 100)
    const s = state()
    const time = charging() ? timeToFull() : timeToEmpty()
    const stateStr = s === Battery.State.CHARGING ? "charging"
                   : s === Battery.State.DISCHARGING ? "discharging"
                   : s === Battery.State.FULLY_CHARGED ? "full"
                   : "unknown"
    const timeStr = time > 0
      ? ` // ${Math.floor(time / 3600)}h ${Math.floor((time % 3600) / 60)}m`
      : ""
    return `${p}%${timeStr} (${stateStr})`
  })

  return (
    <label
      class="bar-icon"
      label={icon}
      tooltipText={tooltip}
    />
  )
}
