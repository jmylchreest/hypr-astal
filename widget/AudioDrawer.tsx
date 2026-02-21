import { createBinding, createComputed, onCleanup, With } from "ags"
import Wp from "gi://AstalWp"
import Astal from "gi://Astal?version=4.0"
import Drawer from "./common/Drawer"
import IconButton from "./common/IconButton"
import layout from "../layouts"

const SPEAKER_ICONS = {
  muted:  "󰝟", // nf-md-volume_off    U+F075F
  low:    "󰕿", // nf-md-volume_low    U+F057F
  medium: "󰖀", // nf-md-volume_medium U+F0580
  high:   "󰕾", // nf-md-volume_high   U+F057E
}

const MIC_ICON =       "󰍬" // nf-md-microphone     U+F036C
const MIC_MUTED_ICON = "󰍭" // nf-md-microphone_off U+F036D

// A reactive volume slider bound directly to an endpoint.
// Uses Astal.Slider (<slider> intrinsic) which wraps Gtk.Scale with
// value/min/max/step props and an onDragged signal.
function VolumeSlider({ endpoint }: { endpoint: Wp.Endpoint }) {
  const volume = createBinding(endpoint, "volume")

  return (
    <slider
      class="volume-slider"
      min={0}
      max={1}
      step={0.01}
      value={volume}
      $={(self: Astal.Slider) => {
        let settingFromBinding = false
        const unsubVol = volume.subscribe((v) => {
          if (!isFinite(v)) return
          settingFromBinding = true
          self.value = v
          settingFromBinding = false
        })
        const id = self.connect("notify::value", () => {
          if (!settingFromBinding && isFinite(self.value)) {
            endpoint.volume = self.value
          }
        })
        // Seed initial value
        const initial = volume.peek()
        if (isFinite(initial)) self.value = initial
        onCleanup(() => {
          unsubVol()
          self.disconnect(id)
        })
      }}
    />
  )
}

// Reactive speaker icon derived from volume + mute bindings on the endpoint.
// Bindings are created once at component mount time — NOT inside computed.
function SpeakerIcon({ endpoint }: { endpoint: Wp.Endpoint }) {
  const muted  = createBinding(endpoint, "mute")
  const volume = createBinding(endpoint, "volume")

  const icon = createComputed(() => {
    if (muted()) return SPEAKER_ICONS.muted
    const v = volume()
    if (v < 0.33) return SPEAKER_ICONS.low
    if (v < 0.66) return SPEAKER_ICONS.medium
    return SPEAKER_ICONS.high
  })

  const tooltip = createComputed(() =>
    `${(volume() * 100) | 0}%${muted() ? " (muted)" : ""}`
  )

  return (
    <IconButton
      icon={icon}
      tooltip={tooltip}
      onClick={() => { endpoint.set_mute(!endpoint.mute) }}
    />
  )
}

function MicIcon({ endpoint }: { endpoint: Wp.Endpoint }) {
  const muted  = createBinding(endpoint, "mute")
  const volume = createBinding(endpoint, "volume")

  const icon = muted.as((m) => m ? MIC_MUTED_ICON : MIC_ICON)
  const tooltip = createComputed(() =>
    `${(volume() * 100) | 0}%${muted() ? " (muted)" : ""}`
  )

  return (
    <IconButton
      icon={icon}
      tooltip={tooltip}
      onClick={() => { endpoint.set_mute(!endpoint.mute) }}
    />
  )
}

export default function AudioDrawer() {
  const wp = Wp.get_default()
  if (!wp) return <box />

  const audio = wp.audio
  if (!audio) return <box />

  // Bind to the default endpoint properties so we re-render when the user
  // switches audio devices (e.g. plugging in headphones).
  const speakerBinding = createBinding(audio, "defaultSpeaker")
  const micBinding     = createBinding(audio, "defaultMicrophone")

  return (
    <With value={speakerBinding}>
      {(speaker) => {
        if (!speaker) return <box />
        return (
          <Drawer
            direction={layout.drawerDirection}
            trigger={<SpeakerIcon endpoint={speaker} />}
          >
            <With value={micBinding}>
              {(mic) => mic ? (
                <box>
                  <VolumeSlider endpoint={mic} />
                  <MicIcon endpoint={mic} />
                </box>
              ) : <box />}
            </With>
            <VolumeSlider endpoint={speaker} />
          </Drawer>
        )
      }}
    </With>
  )
}
