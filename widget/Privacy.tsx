import { createBinding, createComputed } from "ags"
import Hyprland from "gi://AstalHyprland"

const ICONS = {
  screenshare: "󰕧",
  audioin:     "󰍬",
}

const SCREENSHARE_CLASSES = ["obs", "screensho", "record", "wf-recorder", "slurp"]
const AUDIOIN_CLASSES = ["pavucontrol", "easyeffects", "helvum", "pwvucontrol", "mic"]

export default function Privacy() {
  const hypr = Hyprland.get_default()
  const clients = createBinding(hypr, "clients")

  const screenshareActive = clients.as((cls) =>
    cls.some((c) => SCREENSHARE_CLASSES.some((p) =>
      (c.class ?? "").toLowerCase().includes(p) || (c.initialClass ?? "").toLowerCase().includes(p)
    ))
  )

  const audioinActive = clients.as((cls) =>
    cls.some((c) => AUDIOIN_CLASSES.some((p) =>
      (c.class ?? "").toLowerCase().includes(p) || (c.initialClass ?? "").toLowerCase().includes(p)
    ))
  )

  const visible = createComputed(() => screenshareActive() || audioinActive())

  return (
    <box visible={visible}>
      <label
        class="privacy-indicator"
        label={ICONS.screenshare}
        tooltipText="Screen sharing"
        visible={screenshareActive}
      />
      <label
        class="privacy-indicator"
        label={ICONS.audioin}
        tooltipText="Microphone in use"
        visible={audioinActive}
      />
    </box>
  )
}
