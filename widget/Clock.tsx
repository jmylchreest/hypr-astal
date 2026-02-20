import { createPoll } from "ags/time"
import { Gtk } from "ags/gtk4"
import GLib from "gi://GLib"
import layout from "../layouts"

function formatTime(): string {
  const now = GLib.DateTime.new_now_local()
  const weekday = now.format("%a")!
  const date    = now.format("%d %b")!
  const time    = now.format("%H:%M:%S")!
  return `${weekday} ${date}  <b>${time}</b>`
}

export default function Clock() {
  // Seed with current value so label isn't empty on first frame
  const clock    = createPoll(formatTime(), 1000, formatTime)
  const calMonth = createPoll("", 60_000, "cal -w")
  const calYear  = createPoll("", 3_600_000, "cal -y")

  return (
    <menubutton class="clock" tooltipText="Calendar" primary={false}>
      <label useMarkup label={clock} />
      <popover hasArrow={false} position={layout.popoverPosition}>
        <box
          orientation={Gtk.Orientation.VERTICAL}
          spacing={8}
          css="padding: 8px;"
        >
          <label
            class="cal-output"
            label={calMonth}
            halign={Gtk.Align.START}
            selectable
          />
          <Gtk.Separator />
          <label
            class="cal-output cal-year"
            label={calYear}
            halign={Gtk.Align.START}
            selectable
          />
        </box>
      </popover>
    </menubutton>
  )
}
