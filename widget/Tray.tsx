import { createBinding, For } from "ags"
import SystemTray from "gi://AstalTray"
import { Gtk } from "ags/gtk4"

function TrayItem({ item }: { item: SystemTray.TrayItem }) {
  const icon = createBinding(item, "gicon")
  const tooltip = createBinding(item, "tooltip-markup")
  const menu = item.create_menu()

  return (
    <menubutton
      class="tray-item"
      tooltipMarkup={tooltip}
      direction={Gtk.ArrowType.DOWN}
      usePopover={false}
      menu={menu ?? undefined}
    >
      <image gicon={icon} iconSize={Gtk.IconSize.LARGE} />
    </menubutton>
  )
}

export default function Tray() {
  const tray = SystemTray.get_default()
  const items = createBinding(tray, "items")

  return (
    <box class="tray" spacing={8}>
      <For each={items}>
        {(item) => <TrayItem item={item} />}
      </For>
    </box>
  )
}
