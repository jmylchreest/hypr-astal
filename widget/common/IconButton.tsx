import GLib from "gi://GLib"
import { Gtk } from "ags/gtk4"
import { Accessor } from "ags"

type IconButtonProps = {
  icon: string | Accessor<string>
  tooltip?: string | Accessor<string>
  class?: string
  onClick?: () => void
  onMiddleClick?: () => void
  onRightClick?: () => void
  command?: string
}

export default function IconButton({
  icon,
  tooltip,
  class: extraClass,
  onClick,
  onMiddleClick,
  onRightClick,
  command,
}: IconButtonProps) {
  function handlePrimary() {
    if (onClick) onClick()
    else if (command) GLib.spawn_command_line_async(command)
  }

  // For middle/right click we need a GestureClick
  function setupGesture(self: Gtk.Button) {
    if (!onMiddleClick && !onRightClick) return
    const gesture = new Gtk.GestureClick()
    gesture.button = 0 // listen for all buttons
    gesture.connect("released", (_g, _n, _x, _y) => {
      const btn = gesture.get_current_button()
      if (btn === 2 && onMiddleClick) onMiddleClick()
      if (btn === 3 && onRightClick) onRightClick()
    })
    self.add_controller(gesture)
  }

  return (
    <button
      class={`bar-icon${extraClass ? ` ${extraClass}` : ""}`}
      tooltipText={tooltip ?? ""}
      onClicked={handlePrimary}
      $={setupGesture}
    >
      <label label={icon} />
    </button>
  )
}
