import { createBinding } from "ags"
import PowerProfiles from "gi://AstalPowerProfiles"
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
  if (!pp) return <box />

  const profile = createBinding(pp, "activeProfile")
  // profiles is a static list, not a reactive property
  const profileNames = pp.get_profiles().map((p) => p.profile)

  const profileIcon = profile.as((p) => ICONS.profiles[p as keyof typeof ICONS.profiles] ?? ICONS.profiles.balanced)

  return (
    <Drawer
      direction={layout.drawerDirection}
      trigger={
        <box>
          <IconButton
            icon={profileIcon}
            tooltip={profile.as((p) => `Profile: ${p}`)}
            onClick={() => {
              const current = pp.activeProfile
              const idx = profileNames.indexOf(current)
              const next = profileNames[(idx + 1) % profileNames.length]
              if (next) pp.activeProfile = next
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
