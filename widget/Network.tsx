import { createBinding, createComputed, For } from "ags"
import Network from "gi://AstalNetwork"
import { Gtk } from "ags/gtk4"
import layout from "../layouts"

const WIFI_ICONS = ["󰤯", "󰤟", "󰤢", "󰤥", "󰤨"]
const DISCONNECTED_ICON = "󰤮"

export default function NetworkWidget() {
  const net = Network.get_default()
  const wifi = net.wifi

  if (!wifi) {
    // No WiFi adapter -- nothing to show for now
    return <box />
  }

  const strength = createBinding(wifi, "strength")
  const ssid = createBinding(wifi, "ssid")
  const accessPoints = createBinding(wifi, "accessPoints")

  const wifiIcon = createComputed(() => {
    if (!wifi.enabled) return DISCONNECTED_ICON
    const s = strength()
    if (s >= 80) return WIFI_ICONS[4]
    if (s >= 60) return WIFI_ICONS[3]
    if (s >= 40) return WIFI_ICONS[2]
    if (s >= 20) return WIFI_ICONS[1]
    return WIFI_ICONS[0]
  })

  const wifiTooltip = createComputed(() =>
    ssid() ? `${ssid()} (${strength()}%)` : "WiFi disconnected"
  )

  const hasAps = accessPoints.as((aps) => aps.length > 0)

  function AccessPointItem({ ap }: { ap: Network.AccessPoint }) {
    const apSsid = createBinding(ap, "ssid")
    const apStrength = createBinding(ap, "strength")

    const icon = apStrength.as((s) => {
      if (s >= 80) return "network-wireless-signal-excellent-symbolic"
      if (s >= 60) return "network-wireless-signal-good-symbolic"
      if (s >= 40) return "network-wireless-signal-ok-symbolic"
      if (s >= 20) return "network-wireless-signal-weak-symbolic"
      return "network-wireless-signal-none-symbolic"
    })

    return (
      <button onClicked={() => wifi.scan()}>
        <box spacing={8}>
          <image iconName={icon} iconSize={Gtk.IconSize.NORMAL} />
          <label label={apSsid.as((s) => s || "Hidden")} hexpand halign={Gtk.Align.START} />
        </box>
      </button>
    )
  }

  return (
    <menubutton tooltipText={wifiTooltip}>
      <label label={wifiIcon} class="bar-icon" />
      <popover hasArrow={false} position={layout.popoverPosition}>
        <box orientation={Gtk.Orientation.VERTICAL} spacing={4} widthRequest={280}>
          <box spacing={8}>
            <label label="Wi-Fi" hexpand halign={Gtk.Align.START} />
          </box>
          <Gtk.Separator />
          <box orientation={Gtk.Orientation.VERTICAL} spacing={2}>
            <For each={accessPoints}>
              {(ap) => <AccessPointItem ap={ap} />}
            </For>
          </box>
          <label
            label="Scanning..."
            css="opacity: 0.6; padding: 8px;"
            visible={hasAps.as((h) => !h)}
          />
        </box>
      </popover>
    </menubutton>
  )
}
