import { createBinding } from "ags"
import PowerProfiles from "gi://AstalPowerProfiles"
import GLib from "gi://GLib"
import Drawer from "./common/Drawer"
import IconButton from "./common/IconButton"
import layout from "../layouts"

const ICONS = {
  power:      "",
  reboot:     "󰜉",
  lock:       "󰍁",
  quit:       "󰗼",
  profiles: {
    balanced:     "",
    performance:  "",
    "power-saver": "",
  },
}

export default function PowerDrawer() {
  const pp = PowerProfiles.get_default()
  const profile = createBinding(pp, "active-profile")
  const profiles = createBinding(pp, "profiles")

  const profileIcon = profile((p) => ICONS.profiles[p as keyof typeof ICONS.profiles] ?? ICONS.profiles.balanced)

  return (
    <Drawer
      direction={layout.drawerDirection}
      trigger={
        <box>
          <IconButton
            icon={profileIcon}
            tooltip={profile((p) => `Profile: ${p}`)}
            onClick={() => {
              const idx = profiles().findIndex((p) => p === profile())
              const next = profiles()[(idx + 1) % profiles().length]
              if (next) pp.active_profile = next
            }}
          />
        </box>
      }
    >
      <IconButton
        icon={ICONS.lock}
        tooltip="Lock session"
        command="loginctl lock-session"
      />
      <IconButton
        icon={ICONS.reboot}
        tooltip="Reboot system"
        command="hyprshutdown --post-cmd 'systemctl reboot'"
      />
      <IconButton
        icon={ICONS.power}
        tooltip="Power off system"
        command="hyprshutdown --post-cmd 'systemctl poweroff'"
      />
      <IconButton
        icon={ICONS.quit}
        tooltip="Quit Hyprland"
        command="hyprshutdown"
      />
    </Drawer>
  )
}
