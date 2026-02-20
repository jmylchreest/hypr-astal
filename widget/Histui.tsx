import { createPoll } from "ags/time"
import { createComputed } from "ags"
import GLib from "gi://GLib"

type HistuiStatus = {
  text: string
  class: string
  icon: string
  tooltip: string
}

const ICONS: Record<string, string> = {
  empty:    "󰂜",
  dnd:      "󰂛",
  low:      "󱅫",
  normal:   "󱅫",
  critical: "󰂚",
}

function parseStatus(raw: string): HistuiStatus {
  try {
    const parsed = JSON.parse(raw)
    const cls = parsed.class ?? "empty"
    return {
      text:    parsed.text ?? "",
      class:   cls,
      icon:    ICONS[cls] ?? ICONS.empty,
      tooltip: parsed.tooltip ?? "",
    }
  } catch {
    return { text: "", class: "empty", icon: ICONS.empty, tooltip: "" }
  }
}

export default function Histui() {
  const raw = createPoll("", 5000, "histui status --detailed")
  const status = createComputed(() => parseStatus(raw()))

  return (
    <button
      class="bar-icon"
      tooltipText={status((s) => s.tooltip)}
      onClicked={() => GLib.spawn_command_line_async("histui dnd toggle")}
      onButtonReleased={(_, event) => {
        if (event.get_button() === 3) {
          GLib.spawn_command_line_async(
            "hyprctl dispatch exec '[float;size 900 600;center] kitty --class histui-float -e histui tui'"
          )
        }
        if (event.get_button() === 2) {
          GLib.spawn_command_line_async(
            "sh -c 'histui get --format dmenu --since 24h | walker --dmenu -p Notifications'"
          )
        }
      }}
    >
      <label label={status((s) => s.icon)} />
    </button>
  )
}
