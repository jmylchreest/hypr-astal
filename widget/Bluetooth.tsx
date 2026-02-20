import { createBinding, createComputed, For, With } from "ags"
import Bluetooth from "gi://AstalBluetooth"
import { Gtk } from "ags/gtk4"
import layout from "../layouts"

const ICON_CONNECTED = ""
const ICON_OFF = "󰂲"

export default function BluetoothWidget() {
  const bt = Bluetooth.get_default()
  const isPowered = createBinding(bt, "isPowered")
  const devices = createBinding(bt, "devices")

  const icon = isPowered.as((p) => p ? ICON_CONNECTED : ICON_OFF)

  const tooltip = createComputed(() => {
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

    const statusLabel = createComputed(() => {
      if (connected()) return "Connected"
      if (paired()) return "Paired"
      return "Available"
    })

    return (
      <button
        onClicked={() => {
          if (device.connected) {
            device.disconnect_device(null)
          } else {
            device.connect_device(null)
          }
        }}
      >
        <box spacing={8}>
          <image iconName={deviceIcon} iconSize={Gtk.IconSize.NORMAL} />
          <box hexpand orientation={Gtk.Orientation.VERTICAL}>
            <label label={name.as((n) => n || "Unknown")} halign={Gtk.Align.START} />
            <label
              label={statusLabel}
              halign={Gtk.Align.START}
              css="font-size: 11px; opacity: 0.7;"
            />
          </box>
        </box>
      </button>
    )
  }

  const hasDevices = devices.as((ds) => ds.length > 0)

  return (
    <menubutton tooltipText={tooltip}>
      <label label={icon} class="bar-icon" />
      <popover hasArrow={false} position={layout.popoverPosition}>
        <box orientation={Gtk.Orientation.VERTICAL} spacing={4} widthRequest={280}>
          <box spacing={8}>
            <label label="Bluetooth" hexpand halign={Gtk.Align.START} />
            <button onClicked={() => bt.toggle()}>
              <image
                iconName={isPowered.as((p) =>
                  p ? "system-shutdown-symbolic" : "system-run-symbolic"
                )}
                iconSize={Gtk.IconSize.NORMAL}
              />
            </button>
          </box>
          <Gtk.Separator />
          <box orientation={Gtk.Orientation.VERTICAL} spacing={2}>
            <For each={devices} id={(d) => d.address}>
              {(device) => <DeviceItem device={device} />}
            </For>
          </box>
          <label
            label="No devices found"
            css="opacity: 0.6; padding: 8px;"
            visible={hasDevices.as((h) => !h)}
          />
        </box>
      </popover>
    </menubutton>
  )
}
