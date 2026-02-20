import { createBinding } from "ags"
import Battery from "gi://AstalBattery"

const ICONS = {
  battery:   ["", "", "", "", ""],
  charging:  "󰂄",
}

export default function Upower() {
  const bat = Battery.get_default()
  const devices = createBinding(bat, "devices")
  
  // Find the main battery (power-supply = true)
  const battery = devices((ds) => 
    ds.find((d) => d.deviceType === Battery.Type.BATTERY && d.powerSupply) ?? ds[0]
  )
  
  const percent = createBinding(() => battery()?.percentage ?? 0)
  const state = createBinding(() => battery()?.state ?? Battery.State.UNKNOWN)
  const timeToFull = createBinding(() => battery()?.timeToFull)
  const timeToEmpty = createBinding(() => battery()?.timeToEmpty)

  const icon = createBinding(() => {
    const p = percent()
    const s = state()
    if (s === Battery.State.CHARGING || s === Battery.State.FULLY_CHARGED) return ICONS.charging
    const idx = Math.min(4, Math.floor(p / 20))
    return ICONS.battery[idx]
  })

  const tooltip = createBinding(() => {
    const p = percent()
    const s = state()
    const time = s === Battery.State.CHARGING ? timeToFull() : timeToEmpty()
    const stateStr = s === Battery.State.CHARGING ? "charging" 
                   : s === Battery.State.DISCHARGING ? "discharging"
                   : s === Battery.State.FULLY_CHARGED ? "full"
                   : "unknown"
    const timeStr = time ? ` // ${Math.floor(time / 3600)}h ${Math.floor((time % 3600) / 60)}m` : ""
    return `${p}%${timeStr} (${stateStr})`
  })

  const visible = createBinding(() => battery() !== undefined)

  return (
    <label
      class="bar-icon"
      label={icon}
      tooltipText={tooltip}
      visible={visible}
    />
  )
}
