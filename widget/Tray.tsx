import { createBinding } from "ags"
import SystemTray from "gi://AstalTray"
import { Gtk } from "ags/gtk4"

function TrayItem({ item }: { item: SystemTray.TrayItem }) {
  const gicon = createBinding(item, "gicon")
  const tooltip = createBinding(item, "tooltipMarkup")
  const menuModel = createBinding(item, "menuModel")
  const actionGroup = createBinding(item, "actionGroup")

  return (
    <menubutton
      class="tray-item"
      tooltipMarkup={tooltip}
      $={(self: Gtk.MenuButton) => {
        // Insert the action group so menu actions work
        const dispose = actionGroup.subscribe(() => {
          self.insert_action_group("dbusmenu", actionGroup.peek())
        })
        self.insert_action_group("dbusmenu", actionGroup.peek())

        // Notify the tray app before showing the menu
        self.connect("activate", () => item.about_to_show())
      }}
    >
      <image gicon={gicon} iconSize={Gtk.IconSize.NORMAL} />
      {menuModel}
    </menubutton>
  )
}

export default function Tray() {
  const tray = SystemTray.get_default()
  const items = createBinding(tray, "items")

  return (
    <box class="tray" spacing={8}>
      {items((list) => list.map((item) => <TrayItem item={item} />))}
    </box>
  )
}
