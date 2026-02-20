import { createBinding, createComputed, onCleanup } from "ags"
import Wp from "gi://AstalWp"
import { Gtk } from "ags/gtk4"
import Drawer from "./common/Drawer"
import IconButton from "./common/IconButton"
import layout from "../layouts"

const SPEAKER_ICONS = {
  muted:  "󰝟", // nf-md-volume_off        U+F075F
  low:    "󰕿", // nf-md-volume_low        U+F057F
  medium: "󰖀", // nf-md-volume_medium     U+F0580
  high:   "󰕾", // nf-md-volume_high       U+F057E
}

const MIC_ICON =       "󰍬" // nf-md-microphone        U+F036C
const MIC_MUTED_ICON = "󰍭" // nf-md-microphone_off    U+F036D

// A reactive volume slider bound to an AstalWp Endpoint
function VolumeSlider({ endpoint }: { endpoint: Wp.Endpoint }) {
  const volume = createBinding(endpoint, "volume")

  return (
    <scale
      class="volume-slider"
      orientation={Gtk.Orientation.HORIZONTAL}
      drawValue={false}
      min={0}
      max={1}
      step={0.01}
      value={volume}
      $={(self: Gtk.Scale) => {
        // Push slider changes back to wireplumber
        const id = self.connect("value-changed", () => {
          endpoint.volume = self.get_value()
        })
        onCleanup(() => self.disconnect(id))
      }}
    />
  )
}

export default function AudioDrawer() {
  const wp = Wp.get_default()!
  const audio = wp.audio

  // Bind to the default endpoint objects themselves
  const speakerEndpoint = createBinding(audio, "defaultSpeaker")
  const micEndpoint     = createBinding(audio, "defaultMicrophone")

  // Reactive icon/tooltip that re-evaluates when the endpoint or its
  // mute/volume properties change.  We re-bind whenever the endpoint changes.
  const speakerIcon = createComputed(() => {
    const s = speakerEndpoint()
    if (!s) return SPEAKER_ICONS.muted
    const muted  = createBinding(s, "mute")()
    const vol    = createBinding(s, "volume")()
    if (muted) return SPEAKER_ICONS.muted
    if (vol < 0.33) return SPEAKER_ICONS.low
    if (vol < 0.66) return SPEAKER_ICONS.medium
    return SPEAKER_ICONS.high
  })

  const speakerTooltip = createComputed(() => {
    const s = speakerEndpoint()
    if (!s) return "No speaker"
    const muted = createBinding(s, "mute")()
    const vol   = createBinding(s, "volume")()
    return `${(vol * 100) | 0}%${muted ? " (muted)" : ""}`
  })

  const micIcon = createComputed(() => {
    const m = micEndpoint()
    if (!m) return MIC_MUTED_ICON
    const muted = createBinding(m, "mute")()
    return muted ? MIC_MUTED_ICON : MIC_ICON
  })

  const micTooltip = createComputed(() => {
    const m = micEndpoint()
    if (!m) return "No mic"
    const muted = createBinding(m, "mute")()
    const vol   = createBinding(m, "volume")()
    return `${(vol * 100) | 0}%${muted ? " (muted)" : ""}`
  })

  // Peek the current endpoint so mute toggle always targets the live object
  function toggleSpeakerMute() {
    const s = speakerEndpoint.peek()
    if (s) s.set_mute(!s.mute)
  }
  function toggleMicMute() {
    const m = micEndpoint.peek()
    if (m) m.set_mute(!m.mute)
  }

  // The drawer children (revealed on hover): mic icon + mic slider + speaker slider
  // Speaker icon is the trigger (always visible).
  const speakerObj = speakerEndpoint.peek()
  const micObj     = micEndpoint.peek()

  return (
    <Drawer
      direction={layout.drawerDirection}
      trigger={
        <IconButton
          icon={speakerIcon}
          tooltip={speakerTooltip}
          onClick={toggleSpeakerMute}
        />
      }
    >
      {micObj ? <VolumeSlider endpoint={micObj} /> : <box />}
      <IconButton
        icon={micIcon}
        tooltip={micTooltip}
        onClick={toggleMicMute}
      />
      {speakerObj ? <VolumeSlider endpoint={speakerObj} /> : <box />}
    </Drawer>
  )
}
