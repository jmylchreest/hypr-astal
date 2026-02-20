import { createPoll } from "ags/time"
import { createComputed } from "ags"
import GLib from "gi://GLib"

const ICONS = {
  activated:   "",
  deactivated: "",
}

export default function IdleInhibitor() {
  const raw = createPoll("deactivated", 2000, 
    "sh -c 'systemd-inhibit --list 2>/dev/null | grep -q \"hyprland\\|wayland\" && echo activated || echo deactivated'"
  )
  
  const isActivated = createComputed(() => raw() === "activated")
  const icon = createComputed(() => isActivated() ? ICONS.activated : ICONS.deactivated)

  function toggle() {
    if (isActivated()) {
      GLib.spawn_command_line_async("hyprctl dispatch exec 'systemd-inhibit --what=idle --who=hyprland --why=User\\ toggle --mode=block false'")
    } else {
      GLib.spawn_command_line_async("hyprctl dispatch exec 'systemd-inhibit --what=idle --who=hyprland --why=User\\ request --mode=block true'")
    }
  }

  return (
    <button
      class={`idle-inhibitor bar-icon${isActivated((a) => a ? " activated" : "")}`}
      tooltipText={isActivated((a) => a ? "Inhibitor active" : "Inhibitor inactive")}
      onClicked={() => GLib.spawn_command_line_async(
        isActivated() 
          ? "pkill -f 'systemd-inhibit.*idle'"
          : "hyprctl dispatch exec 'systemd-inhibit --what=idle --who=hyprland --why=User request --mode=block sleep infinity'"
      )}
    >
      <label label={icon} />
    </button>
  )
}
