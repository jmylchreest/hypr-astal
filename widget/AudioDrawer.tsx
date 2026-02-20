import { createBinding } from "ags"
import Wireplumber from "gi://AstalWireplumber"
import { Gtk } from "ags/gtk4"
import Drawer from "./common/Drawer"
import IconButton from "./common/IconButton"
import layout from "../layouts"

const SPEAKER_ICONS = {
  muted:   "",
  low:     "",
  medium:  "",
  high:    "",
  headphone: "",
}

const MIC_ICON = "󰍬"
const MIC_MUTED_ICON = ""

function VolumeSlider({ device, vertical = false }: { device: Wireplumber.AudioDevice; vertical?: boolean }) {
  const volume = createBinding(device, "volume")
  const muted = createBinding(device, "mute")

  function onScroll(_: Gtk.EventControllerScroll, dx: number, dy: number) {
    const step = 0.05
    const newVol = Math.max(0, Math.min(1, device.volume - dy * step))
    device.volume = newVol
  }

  return (
    <box>
      <scale
        class="volume-slider"
        orientation={Gtk.Orientation.HORIZONTAL}
        value={volume}
        onValueChanged={({ value }) => { device.volume = value }}
        min={0}
        max={1}
        hexpand
      />
    </box>
  )
}

export default function AudioDrawer() {
  const wp = Wireplumber.get_default()
  const audio = createBinding(wp, "audio")
  
  const speaker = audio((devs) => devs.find((d) => d.type === Wireplumber.AudioType.SPEAKER && d.default))
  const mic = audio((devs) => devs.find((d) => d.type === Wireplumber.AudioType.MICROPHONE && d.default))

  const speakerIcon = createBinding(() => {
    if (!speaker) return SPEAKER_ICONS.muted
    if (speaker.mute) return SPEAKER_ICONS.muted
    const vol = speaker.volume
    if (vol < 0.33) return SPEAKER_ICONS.low
    if (vol < 0.66) return SPEAKER_ICONS.medium
    return SPEAKER_ICONS.high
  })

  const speakerTooltip = createBinding(() => {
    if (!speaker) return "No speaker"
    return `${speaker.volume * 100 | 0}%${speaker.mute ? " (muted)" : ""}`
  })

  const micIcon = createBinding(() => {
    if (!mic) return MIC_MUTED_ICON
    return mic.mute ? MIC_MUTED_ICON : MIC_ICON
  })

  return (
    <Drawer
      direction={layout.drawerDirection}
      trigger={
        <IconButton
          icon={speakerIcon}
          tooltip={speakerTooltip}
          onClick={() => { if (speaker) speaker.mute = !speaker.mute }}
          onMiddleClick={() => {}}
        />
      }
    >
      <IconButton
        icon={micIcon}
        tooltip={mic ? `${mic.volume * 100 | 0}%${mic.mute ? " (muted)" : ""}` : "No mic"}
        onClick={() => { if (mic) mic.mute = !mic.mute }}
      />
      {speaker && <VolumeSlider device={speaker} />}
    </Drawer>
  )
}
