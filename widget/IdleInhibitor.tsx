import { createState } from "ags"
import GLib from "gi://GLib"

const ICONS = {
  activated:   "",
  deactivated: "",
}

let inhibitCookie: number | null = null

export default function IdleInhibitor() {
  const [isActivated, setIsActivated] = createState(false)

  function toggle() {
    if (isActivated()) {
      // Kill any running inhibit processes
      GLib.spawn_command_line_async("pkill -f 'systemd-inhibit.*idle'")
      setIsActivated(false)
    } else {
      // Start idle inhibitor in background
      GLib.spawn_command_line_async(
        "systemd-inhibit --what=idle --who=hyprbar --why='User requested' --mode=block sleep infinity"
      )
      setIsActivated(true)
    }
  }

  return (
    <button
      class={`idle-inhibitor bar-icon${isActivated((a) => a ? " activated" : "")}`}
      tooltipText={isActivated((a) => a ? "Idle inhibited" : "Idle not inhibited")}
      onClicked={toggle}
    >
      <label label={isActivated((a) => a ? ICONS.activated : ICONS.deactivated)} />
    </button>
  )
}
