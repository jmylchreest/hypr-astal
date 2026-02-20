import { createBinding } from "ags"
import Bluetooth from "gi://AstalBluetooth"
import { Gtk } from "ags/gtk4"
import layout from "../layouts"

const ICON_CONNECTED = ""
const ICON_OFF = "󰂲"

export default function BluetoothWidget() {
  const bt = Bluetooth.get_default()
  const isPowered = createBinding(bt, "isPowered")
  const devices = createBinding(bt, "devices")

  const icon = isPowered((p) => p ? ICON_CONNECTED : ICON_OFF)

  const tooltip = createBinding(() => {
    if (!isPowered()) return "Bluetooth off"
    const connected = devices().filter((d) => d.connected)
    if (connected.length === 0) return "Bluetooth on"
    return `Bluetooth: ${connected.length} connected`
  })

  function DeviceItem({ device }: { device: Bluetooth.Device }) {
    const name = createBinding(device, "name")
    const connected = createBinding(device, "connected")
    const paired = createBinding(device, "paired")
    const deviceIcon = createBinding(device, "icon")

    return (
      <button
        onClicked={() => {
          if (device.connected) {
            device.disconnect_device(() => {})
          } else {
            device.connect_device(() => {})
          }
        }}
      >
        <box spacing={8}>
          <image iconName={deviceIcon} iconSize={Gtk.IconSize.NORMAL} />
          <box hexpand orientation={Gtk.Orientation.VERTICAL}>
            <label label={name((n) => n || "Unknown")} halign={Gtk.Align.START} />
            <label
              label={connected((c) => c ? "Connected" : paired((p) => p ? "Paired" : "Available"))}
              halign={Gtk.Align.START}
              css="font-size: 11px; opacity: 0.7;"
            />
          </box>
        </box>
      </button>
    )
  }

  return (
    <menubutton tooltipText={tooltip}>
      <label label={icon} />
      <popover hasArrow={false} position={layout.popoverPosition}>
        <box orientation={Gtk.Orientation.VERTICAL} spacing={4} widthRequest={280} margin={8}>
          <box spacing={8} margin={4}>
            <label label="Bluetooth" hexpand halign={Gtk.Align.START} />
            <button
              onClicked={() => {
                if (isPowered()) {
                  bt.adapter?.power_off()
                } else {
                  bt.adapter?.power_on()
                }
              }}
            >
              <image
                iconName={isPowered((p) => p ? "system-shutdown-symbolic" : "system-run-symbolic")}
                iconSize={Gtk.IconSize.NORMAL}
              />
            </button>
          </box>
          <separator />
          {devices((ds) => ds.length > 0 && (
            <box orientation={Gtk.Orientation.VERTICAL} spacing={2}>
              {ds.map((d) => <DeviceItem device={d} />)}
            </box>
          ))}
          {devices((ds) => ds.length === 0 && (
            <label label="No devices found" css="opacity: 0.6; padding: 8px;" />
          ))}
        </box>
      </popover>
    </menubutton>
  )
}
