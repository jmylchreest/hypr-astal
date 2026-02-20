export type ColourScheme = "dark" | "light" | "auto"

export type Config = {
  layout: string
  colours: string
  colourScheme: ColourScheme
  persistentWorkspaces: number[]
  start: string[]
  centre: string[]
  end: string[]
}

const defaults: Config = {
  layout: "default",
  colours: "default",
  colourScheme: "dark",
  persistentWorkspaces: [1, 2, 3, 4, 5],
  start: ["workspaces", "submap"],
  centre: ["clock", "histui"],
  end: [
    "tray",
    "idle-inhibitor",
    "network",
    "bluetooth",
    "upower",
    "privacy",
    "audio-drawer",
    "power-drawer",
  ],
}

export default defaults
