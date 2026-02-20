import { createBinding, onCleanup, For } from "ags"
import SystemTray from "gi://AstalTray"
import { Gtk } from "ags/gtk4"

function TrayItem({ item }: { item: SystemTray.TrayItem }) {
  const gicon      = createBinding(item, "gicon")
  const tooltip    = createBinding(item, "tooltipMarkup")
  const menuModel  = createBinding(item, "menuModel")
  const actionGroup = createBinding(item, "actionGroup")

  return (
    <menubutton
      class="tray-item"
      tooltipMarkup={tooltip}
      $={(self: Gtk.MenuButton) => {
        // Set initial menu model and action group
        self.set_menu_model(menuModel.peek())
        self.insert_action_group("dbusmenu", actionGroup.peek())

        // Keep them reactive — tray items can update their menu
        const unsubMenu = menuModel.subscribe(() => {
          self.set_menu_model(menuModel.peek())
        })
        const unsubAG = actionGroup.subscribe(() => {
          self.insert_action_group("dbusmenu", actionGroup.peek())
        })

        // Let the StatusNotifierItem know we're about to show
        self.connect("activate", () => item.about_to_show())

        onCleanup(() => {
          unsubMenu()
          unsubAG()
        })
      }}
    >
      <image gicon={gicon} iconSize={Gtk.IconSize.NORMAL} />
    </menubutton>
  )
}

export default function Tray() {
  const tray  = SystemTray.get_default()
  const items = createBinding(tray, "items")

  return (
    <box class="tray" spacing={4}>
      <For each={items} id={(item) => item.itemId}>
        {(item) => <TrayItem item={item} />}
      </For>
    </box>
  )
}
