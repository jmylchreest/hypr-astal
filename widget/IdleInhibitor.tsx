import { createState } from "ags"
import GLib from "gi://GLib"

// Single icon — colour changes via CSS: accent when active, dim when inactive
const ICON = "\uF0F4" // nf-fa-coffee  U+F0F4

export default function IdleInhibitor() {
  const [isActivated, setIsActivated] = createState(false)

  function toggle() {
    if (isActivated()) {
      GLib.spawn_command_line_async("pkill -f 'systemd-inhibit.*idle'")
      setIsActivated(false)
    } else {
      GLib.spawn_command_line_async(
        "systemd-inhibit --what=idle --who=hyprbar --why='User requested' --mode=block sleep infinity"
      )
      setIsActivated(true)
    }
  }

  const labelClass = isActivated.as((a) => `bar-icon idle-inhibitor${a ? " activated" : ""}`)
  const tooltip    = isActivated.as((a) => a ? "Idle inhibited — click to allow" : "Allow idle — click to inhibit")

  return (
    <button
      class="icon-btn"
      tooltipText={tooltip}
      onClicked={toggle}
    >
      <label class={labelClass} label={ICON} />
    </button>
  )
}
