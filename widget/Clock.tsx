import { createPoll } from "ags/time"
import { onCleanup } from "ags"
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
    <button
      class="clock"
      tooltipText="Calendar"
      $={(self: Gtk.Button) => {
        // Build popover manually — avoids Gtk.MenuButton's primary/F10 focus system
        const popover = new Gtk.Popover({
          hasArrow: false,
          position: layout.popoverPosition,
        })

        const calBox = new Gtk.Box({
          orientation: Gtk.Orientation.VERTICAL,
          spacing: 8,
        })
        calBox.set_margin_top(8)
        calBox.set_margin_bottom(8)
        calBox.set_margin_start(8)
        calBox.set_margin_end(8)

        const calMonthLabel = new Gtk.Label({
          halign: Gtk.Align.START,
          selectable: true,
        })
        calMonthLabel.add_css_class("cal-output")

        const sep = new Gtk.Separator({ orientation: Gtk.Orientation.HORIZONTAL })

        const calYearLabel = new Gtk.Label({
          halign: Gtk.Align.START,
          selectable: true,
        })
        calYearLabel.add_css_class("cal-output")
        calYearLabel.add_css_class("cal-year")

        calBox.append(calMonthLabel)
        calBox.append(sep)
        calBox.append(calYearLabel)

        popover.set_child(calBox)
        popover.set_parent(self)

        // Keep calendar labels up to date
        const unsubMonth = calMonth.subscribe((v) => { calMonthLabel.label = v })
        const unsubYear  = calYear.subscribe((v) => { calYearLabel.label = v })

        // Seed initial values
        calMonthLabel.label = calMonth.peek() ?? ""
        calYearLabel.label  = calYear.peek() ?? ""

        const id = self.connect("clicked", () => popover.popup())

        onCleanup(() => {
          unsubMonth()
          unsubYear()
          self.disconnect(id)
          popover.unparent()
        })
      }}
    >
      <label useMarkup class="clock-label" label={clock} />
    </button>
  )
}
