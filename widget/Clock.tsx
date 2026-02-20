import { createPoll } from "ags/time"
import GLib from "gi://GLib"

function formatDate(): string {
  const now = GLib.DateTime.new_now_local()
  const weekday = now.format("%A")!
  const date = now.format("%b %-e")!
  const time = now.format("%H:%M:%S")!
  return `${weekday}, ${date} @ <b>${time}</b>`
}

export default function Clock() {
  const clock = createPoll("", 1000, formatDate)

  return (
    <label
      class="clock"
      useMarkup={true}
      label={clock}
      tooltipText="Click to open calendar"
    />
  )
}
