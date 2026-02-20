import { createBinding, createComputed } from "ags"
import Wp from "gi://AstalWp"
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

export default function AudioDrawer() {
  const wp = Wp.get_default()!
  const audio = wp.audio

  const speaker = createBinding(audio, "defaultSpeaker")
  const mic = createBinding(audio, "defaultMicrophone")

  const speakerIcon = createComputed(() => {
    const s = speaker()
    if (!s || s.mute) return SPEAKER_ICONS.muted
    const vol = s.volume
    if (vol < 0.33) return SPEAKER_ICONS.low
    if (vol < 0.66) return SPEAKER_ICONS.medium
    return SPEAKER_ICONS.high
  })

  const speakerTooltip = createComputed(() => {
    const s = speaker()
    if (!s) return "No speaker"
    return `${(s.volume * 100) | 0}%${s.mute ? " (muted)" : ""}`
  })

  const micIcon = createComputed(() => {
    const m = mic()
    if (!m) return MIC_MUTED_ICON
    return m.mute ? MIC_MUTED_ICON : MIC_ICON
  })

  const micTooltip = createComputed(() => {
    const m = mic()
    if (!m) return "No mic"
    return `${(m.volume * 100) | 0}%${m.mute ? " (muted)" : ""}`
  })

  return (
    <Drawer
      direction={layout.drawerDirection}
      trigger={
        <IconButton
          icon={speakerIcon}
          tooltip={speakerTooltip}
          onClick={() => {
            const s = speaker.peek()
            if (s) s.mute = !s.mute
          }}
        />
      }
    >
      <IconButton
        icon={micIcon}
        tooltip={micTooltip}
        onClick={() => {
          const m = mic.peek()
          if (m) m.mute = !m.mute
        }}
      />
    </Drawer>
  )
}
