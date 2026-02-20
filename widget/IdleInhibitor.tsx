import { createState, createComputed } from "ags"
import GLib from "gi://GLib"

const ICONS = {
  activated:   "\uF0F4", // nf-fa-coffee   U+F0F4 
  deactivated: "\uF186", // nf-fa-moon_o   U+F186 
}

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

  const cssClass = isActivated.as((a) => `idle-inhibitor bar-icon${a ? " activated" : ""}`)
  const tooltip = isActivated.as((a) => a ? "Idle inhibited" : "Idle not inhibited")
  const icon = isActivated.as((a) => a ? ICONS.activated : ICONS.deactivated)

  return (
    <button
      class={cssClass}
      tooltipText={tooltip}
      onClicked={toggle}
    >
      <label label={icon} />
    </button>
  )
}
