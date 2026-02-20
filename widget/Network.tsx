import { createBinding } from "ags"
import Network from "gi://AstalNetwork"
import GLib from "gi://GLib"
import IconButton from "./common/IconButton"

const WIFI_ICONS = ["󰤯", "󰤟", "󰤢", "󰤥", "󰤨"]
const ETHERNET_ICON = "󰈀"
const DISCONNECTED_ICON = "󰤮"

export default function NetworkWidget() {
  const net = Network.get_default()
  const wifi = net.wifi
  const wired = net.wired

  const wifiIcon = createBinding(wifi, "strength").((s) => {
    if (!wifi.enabled) return DISCONNECTED_ICON
    if (s >= 80) return WIFI_ICONS[4]
    if (s >= 60) return WIFI_ICONS[3]
    if (s >= 40) return WIFI_ICONS[2]
    if (s >= 20) return WIFI_ICONS[1]
    return WIFI_ICONS[0]
  })

  const wifiTooltip = createBinding(wifi, "ssid").((ssid) =>
    ssid ? `${ssid} // ${wifi.strength}%` : "WiFi disconnected"
  )

  const wiredIcon = createBinding(wired, "addresses").((addrs) =>
    addrs.length > 0 ? ETHERNET_ICON : ""
  )

  const wiredTooltip = createBinding(wired, "addresses").((addrs) =>
    addrs.length > 0 ? "Ethernet connected" : "Ethernet disconnected"
  )

  function openNmtui() {
    GLib.spawn_command_line_async(
      "hyprctl dispatch exec '[float;size 900 600;center] kitty --class nmtui-float -e nmtui'"
    )
  }

  return (
    <box spacing={0}>
      <IconButton
        icon={wiredIcon}
        tooltip={wiredTooltip}
        onMiddleClick={openNmtui}
      />
      <IconButton
        icon={wifiIcon}
        tooltip={wifiTooltip}
        onMiddleClick={openNmtui}
      />
    </box>
  )
}
