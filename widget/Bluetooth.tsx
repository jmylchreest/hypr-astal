import { createBinding } from "ags"
import Bluetooth from "gi://AstalBluetooth"
import GLib from "gi://GLib"
import IconButton from "./common/IconButton"

const ICON_CONNECTED = ""
const ICON_OFF = "󰂲"

export default function BluetoothWidget() {
  const bt = Bluetooth.get_default()

  const isPowered = createBinding(bt, "isPowered")
  const devices = createBinding(bt, "devices")
  const connectedDevices = devices((ds) => ds.filter((d) => d.connected))

  const icon = isPowered((p) => p ? ICON_CONNECTED : ICON_OFF)

  const tooltip = createBinding(() => {
    if (!isPowered()) return "Bluetooth off"
    const connected = connectedDevices()
    if (connected.length === 0) return "Bluetooth on\nNo devices connected"
    return `Bluetooth on\n${connected.length} device(s) connected\n${connected.map((d) => d.name).join(", ")}`
  })

  function openBluetui() {
    GLib.spawn_command_line_async(
      "hyprctl dispatch exec '[float;size 900 600;center] kitty --class bluetui-float -e bluetui'"
    )
  }

  return (
    <IconButton
      icon={icon}
      tooltip={tooltip}
      onMiddleClick={openBluetui}
      onClick={() => {
        if (isPowered()) {
          GLib.spawn_command_line_async("rfkill block bluetooth")
        } else {
          GLib.spawn_command_line_async("rfkill unblock bluetooth")
        }
      }}
    />
  )
}
