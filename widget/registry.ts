import Workspaces from "./Workspaces"
import Submap from "./Submap"
import Clock from "./Clock"
import Histui from "./Histui"
import Tray from "./Tray"
import IdleInhibitor from "./IdleInhibitor"
import Network from "./Network"
import Bluetooth from "./Bluetooth"
import Upower from "./Upower"
import Privacy from "./Privacy"
import AudioDrawer from "./AudioDrawer"
import PowerDrawer from "./PowerDrawer"

const registry: Record<string, () => JSX.Element> = {
  "workspaces":     Workspaces,
  "submap":         Submap,
  "clock":          Clock,
  "histui":         Histui,
  "tray":           Tray,
  "idle-inhibitor": IdleInhibitor,
  "network":        Network,
  "bluetooth":      Bluetooth,
  "upower":         Upower,
  "privacy":        Privacy,
  "audio-drawer":   AudioDrawer,
  "power-drawer":   PowerDrawer,
}

export default registry
