import { createBinding, onCleanup, For } from "ags"
import SystemTray from "gi://AstalTray"
import { Gtk } from "ags/gtk4"

function TrayItem({ item }: { item: SystemTray.TrayItem }) {
  const gicon       = createBinding(item, "gicon")
  const tooltip     = createBinding(item, "tooltipMarkup")
  const menuModel   = createBinding(item, "menuModel")
  const actionGroup = createBinding(item, "actionGroup")

  return (
    <button
      class="tray-item"
      tooltipMarkup={tooltip}
      $={(self: Gtk.Button) => {
        // Build a PopoverMenu anchored to this button for right-click / menu
        const popover = new Gtk.PopoverMenu({ hasArrow: false })
        popover.set_parent(self)

        function updateMenu() {
          const model = menuModel.peek()
          if (model) popover.set_menu_model(model)
        }
        function updateActionGroup() {
          const ag = actionGroup.peek()
          if (ag) popover.insert_action_group("dbusmenu", ag)
        }

        updateMenu()
        updateActionGroup()

        const unsubMenu = menuModel.subscribe(updateMenu)
        const unsubAG   = actionGroup.subscribe(updateActionGroup)

        // Left-click: send activate to the tray app (e.g. raise window)
        // Right-click: show context menu
        const gesture = new Gtk.GestureClick()
        gesture.button = 0 // listen to all mouse buttons
        gesture.connect("released", (_g, _nPress, x, y) => {
          const btn = gesture.get_current_button()
          if (btn === 1) {
            item.activate(Math.round(x), Math.round(y))
          } else if (btn === 3) {
            item.about_to_show()
            updateMenu()
            popover.popup()
          }
        })
        self.add_controller(gesture)

        onCleanup(() => {
          unsubMenu()
          unsubAG()
          popover.unparent()
        })
      }}
    >
      <image gicon={gicon} iconSize={Gtk.IconSize.NORMAL} />
    </button>
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
