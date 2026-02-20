import { createPoll } from "ags/time"
import { createComputed } from "ags"
import GLib from "gi://GLib"

const ICONS = {
  screenshare: "󰕧",
  audioin:     "󰍬",
}

type PrivacyInfo = {
  screenshare: boolean
  audioin: boolean
  tooltip: string
}

function parsePrivacy(raw: string): PrivacyInfo {
  try {
    const parsed = JSON.parse(raw)
    return {
      screenshare: parsed.screenshare ?? false,
      audioin: parsed.audioin ?? false,
      tooltip: parsed.tooltip ?? "",
    }
  } catch {
    return { screenshare: false, audioin: false, tooltip: "" }
  }
}

export default function Privacy() {
  const raw = createPoll('{"screenshare":false,"audioin":false}', 2000,
    "sh -c 'hyprctl clients -j 2>/dev/null | jq -c \"{screenshare: [.[] | select(.class | test(\\\"(obs|screensho|record)\\\"; \\\"i\\\")) ] | length > 0, audioin: [.[] | select(.class | test(\\\"(pavucontrol|audio|mic)\\\"; \\\"i\\\")) ] | length > 0}\" 2>/dev/null || echo \"{\\\"screenshare\\\":false,\\\"audioin\\\":false}\"'"
  )

  const info = createComputed(() => parsePrivacy(raw()))

  return (
    <box visible={info((i) => i.screenshare || i.audioin)}>
      {info((i) => i.screenshare && (
        <label
          class="privacy-indicator"
          label={ICONS.screenshare}
          tooltipText="Screen sharing"
        />
      ))}
      {info((i) => i.audioin && (
        <label
          class="privacy-indicator"
          label={ICONS.audioin}
          tooltipText="Microphone in use"
        />
      ))}
    </box>
  )
}
