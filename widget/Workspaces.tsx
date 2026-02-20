import { createBinding, createComputed, For } from "ags"
import Hyprland from "gi://AstalHyprland"
import { getConfig } from "../config.loader"

type WorkspaceEntry = { id: number }

export default function Workspaces() {
  const config = getConfig()
  const hypr = Hyprland.get_default()
  const workspaces = createBinding(hypr, "workspaces")
  const focusedWorkspace = createBinding(hypr, "focusedWorkspace")

  // Derive a sorted list of workspace IDs (persistent + active)
  const wsEntries = workspaces.as((wss) => {
    const ids = new Set([...config.persistentWorkspaces, ...wss.map((w) => w.id)])
    return [...ids].sort((a, b) => a - b).map((id) => ({ id }))
  })

  return (
    <box class="workspaces" spacing={2}>
      <For each={wsEntries} id={(e) => e.id}>
        {(entry) => {
          const id = entry.id
          const isActive = focusedWorkspace.as((f) => f?.id === id)
          const label = id <= 9 ? String(id) : ""

          return (
            <button
              class={isActive.as((a) => a ? "active" : "")}
              onClicked={() => {
                const ws = hypr.get_workspaces().find((w) => w.id === id)
                if (ws) {
                  ws.focus()
                } else {
                  hypr.dispatch("workspace", String(id))
                }
              }}
            >
              <label label={label} class="bar-icon" />
            </button>
          )
        }}
      </For>
    </box>
  )
}
