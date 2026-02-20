import { createBinding } from "ags"
import Hyprland from "gi://AstalHyprland"
import config from "../config.defaults"

export default function Workspaces() {
  const hypr = Hyprland.get_default()
  const workspaces = createBinding(hypr, "workspaces")
  const focused = createBinding(hypr, "focused-workspace")

  return (
    <box class="workspaces" spacing={2}>
      {workspaces((wss) => {
        const ids = new Set([...config.persistentWorkspaces, ...wss.map((w) => w.id)])
        return [...ids]
          .sort((a, b) => a - b)
          .map((id) => {
            const ws = wss.find((w) => w.id === id)
            const isActive = focused((f) => f?.id === id)
            const label = id <= 9 ? String(id) : ""

            return (
              <button
                class={isActive((a) => (a ? "active" : ""))}
                onClicked={() => {
                  if (ws) {
                    ws.focus()
                  } else {
                    Hyprland.get_default().dispatch("workspace", String(id))
                  }
                }}
              >
                <label label={label} class="bar-icon" />
              </button>
            )
          })
      })}
    </box>
  )
}
