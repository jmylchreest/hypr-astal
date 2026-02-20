import { createBinding } from "ags"
import Network from "gi://AstalNetwork"
import { Gtk } from "ags/gtk4"
import layout from "../layouts"

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
    ssid ? `${ssid} (${wifi.strength}%)` : "WiFi disconnected"
  )

  const wiredIcon = createBinding(wired, "addresses").((addrs) =>
    addrs.length > 0 ? ETHERNET_ICON : ""
  )

  const wiredTooltip = createBinding(wired, "addresses").((addrs) =>
    addrs.length > 0 ? "Ethernet connected" : "Ethernet disconnected"
  )

  const accessPoints = createBinding(wifi, "access-points")

  function AccessPointItem({ ap }: { ap: Network.AccessPoint }) {
    const ssid = createBinding(ap, "ssid")
    const strength = createBinding(ap, "strength")
    const flags = createBinding(ap, "flags")
    const active = createBinding(wifi, "ssid").((s) => s === ap.ssid)

    const icon = strength((s) => {
      if (s >= 80) return "network-wireless-signal-excellent-symbolic"
      if (s >= 60) return "network-wireless-signal-good-symbolic"
      if (s >= 40) return "network-wireless-signal-ok-symbolic"
      if (s >= 20) return "network-wireless-signal-weak-symbolic"
      return "network-wireless-signal-none-symbolic"
    })

    return (
      <button
        onClicked={() => {
          wifi.scan()
        }}
      >
        <box spacing={8}>
          <image iconName={icon} iconSize={Gtk.IconSize.NORMAL} />
          <label label={ssid((s) => s || "Hidden")} hexpand halign={Gtk.Align.START} />
          {active((a) => a && (
            <image iconName="emblem-ok-symbolic" iconSize={Gtk.IconSize.NORMAL} />
          ))}
        </box>
      </button>
    )
  }

  return (
    <box spacing={0}>
      {wiredIcon((i) => i && (
        <label class="bar-icon" label={i} tooltipText={wiredTooltip()} />
      ))}
      <menubutton tooltipText={wifiTooltip}>
        <label label={wifiIcon} />
        <popover hasArrow={false} position={layout.popoverPosition}>
          <box orientation={Gtk.Orientation.VERTICAL} spacing={4} widthRequest={280} margin={8}>
            <box spacing={8} margin={4}>
              <label label="Wi-Fi" hexpand halign={Gtk.Align.START} />
              <button
                onClicked={() => {
                  if (wifi.enabled) {
                    wifi.disable()
                  } else {
                    wifi.enable()
                  }
                }}
              >
                <image
                  iconName={createBinding(wifi, "enabled")((e) => 
                    e ? "system-shutdown-symbolic" : "system-run-symbolic"
                  )}
                  iconSize={Gtk.IconSize.NORMAL}
                />
              </button>
            </box>
            <separator />
            {accessPoints((aps) => aps.length > 0 && (
              <box orientation={Gtk.Orientation.VERTICAL} spacing={2}>
                {aps.slice(0, 8).map((ap) => <AccessPointItem ap={ap} />)}
              </box>
            ))}
            {accessPoints((aps) => aps.length === 0 && (
              <label label="Scanning..." css="opacity: 0.6; padding: 8px;" />
            )}
          </box>
        </popover>
      </menubutton>
    </box>
  )
}
