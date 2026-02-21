import { createPoll } from "ags/time"
import { execAsync } from "ags/process"
import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib"

type HistuiStatus = {
  text: string
  class: string
  icon: string
  tooltip: string
}

const ICONS: Record<string, string> = {
  empty:             "󰂜", // nf-md-bell_outline       U+F009C
  dnd:               "󰂛", // nf-md-bell_off            U+F009B
  low:               "󱅫", // nf-md-bell_badge_outline  U+F116B
  normal:            "󱅫", // nf-md-bell_badge_outline  U+F116B
  "has-notifications": "󱅫",
  critical:          "󰂚", // nf-md-bell_ring           U+F009A
}

function parseStatus(raw: string): HistuiStatus {
  try {
    const parsed = JSON.parse(raw)
    // Use `alt` for clean single-token class (e.g. "normal", "dnd", "empty")
    // `class` can be compound like "has-notifications normal"
    const cls = parsed.alt ?? parsed.class ?? "empty"
    return {
      text:    parsed.text ?? "",
      class:   cls,
      icon:    ICONS[cls] ?? ICONS.normal,
      tooltip: parsed.tooltip ?? "",
    }
  } catch {
    return { text: "", class: "empty", icon: ICONS.empty, tooltip: "" }
  }
}

export default function Histui() {
  const raw = createPoll("", 5000, (prev) => execAsync("histui status --detailed").catch(() => prev))
  const status = raw.as(parseStatus)

  function setupGesture(self: Gtk.Button) {
    const gesture = new Gtk.GestureClick()
    gesture.button = 0
    gesture.connect("released", () => {
      const btn = gesture.get_current_button()
      if (btn === 3) {
        GLib.spawn_command_line_async(
          "hyprctl dispatch exec '[float;size 900 600;center] kitty --class histui-float -e histui tui'"
        )
      }
      if (btn === 2) {
        GLib.spawn_command_line_async(
          "sh -c 'histui get --format dmenu --since 24h | walker --dmenu -p Notifications'"
        )
      }
    })
    self.add_controller(gesture)
  }

  return (
    <button
      class="icon-btn"
      tooltipText={status.as((s) => s.tooltip)}
      onClicked={() => GLib.spawn_command_line_async("histui dnd toggle")}
      $={setupGesture}
    >
      <label class="bar-icon" label={status.as((s) => s.icon)} />
    </button>
  )
}
