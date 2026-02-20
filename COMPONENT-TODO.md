# Component TODO

Future widgets and panels for hypr-astal. Each entry includes the Astal/GI
library to use, references, and implementation notes for LLM-assisted development.

---

## Quick Settings / Mission Control Sidebar

**Priority:** High  
**Inspired by:** Marble right panel, GNOME Quick Settings (Shell 43+)  
**Reference:** https://marble-shell.pages.dev/full.png — the right-side panel showing
Bluetooth, Power Profiles, theme toggle, audio sliders, media player, battery, notifications.

A slide-in panel anchored to the top-right (or toggled via a bar button) containing:

- Network toggle + SSID + signal strength (AstalNetwork)
- Bluetooth toggle + connected device name (AstalBluetooth)
- Power profile selector: balanced / performance / power-saver (AstalPowerProfiles)
- Dark/light mode toggle (Adw.StyleManager.colorScheme)
- Volume slider + mic mute (AstalWp / gi://AstalWp)
- Brightness slider (gi://AstalBrightness or logind DBus)
- Battery status + time-to-empty/full (gi://AstalBattery)
- Media player card (see below)
- Notification history list (see below)

**Implementation notes:**
- Use `Astal.Window` with `anchor = RIGHT | TOP | BOTTOM`, `exclusivity = NORMAL`,
  `layer = OVERLAY` so it floats above other windows
- Reveal with `Gtk.Revealer` (SLIDE_LEFT transition) driven by a `createState(false)`
  toggled from a bar button
- The bar button sends a `ags request toggle-panel` — implement `requestHandler` in
  `app.ts` to toggle the panel's `visible` state
- Sections are separated by `Gtk.Separator` with category headings

---

## Media Player (MPRIS)

**Priority:** High  
**Library:** `gi://AstalMpris`  
**Inspired by:** Marble `MprisList` + `MprisCoverArt` + `MprisPositionSlider`  
**Reference:** https://marble-shell.pages.dev/features#mediaplayer

Shows the currently playing track with cover art, title, artist, playback controls,
and a progress slider. Designed to live inside the Quick Settings panel.

**Key API:**
```ts
import Mpris from "gi://AstalMpris"
const mpris = Mpris.get_default()
// mpris.players — list of Player objects
// player.title, player.artist, player.coverArt (file path)
// player.playbackStatus — Playing / Paused / Stopped
// player.position, player.length
// player.play(), player.pause(), player.playPause()
// player.next(), player.previous()
// player.shuffle, player.loopStatus
```

**Implementation notes:**
- Use `createBinding(mpris, "players")` + `<For>` to show all players or pick the
  most recently active one
- Cover art: `<image file={coverArt} />` — falls back to app icon if no cover
- Progress: `Gtk.Scale` with `value` bound to `player.position`, `max` = `player.length`
  — update position via `scale.connect("value-changed", ...)`
- Poll position every 1s with `createPoll` for the time display (MPRIS position
  property doesn't emit notify reliably on all players)

---

## Notification Centre

**Priority:** High  
**Libraries:** `gi://AstalNotifd`, and optionally `histui` native bindings  
**Inspired by:** Marble notification panel, GNOME notification list  

Two parts:

### A. Notification Popups
Toast-style popups in the top-right corner for incoming notifications.

**Key API:**
```ts
import Notifd from "gi://AstalNotifd"
const notifd = Notifd.get_default()
// notifd.connect("notified", (_, id) => { const n = notifd.get_notification(id) })
// n.appName, n.summary, n.body, n.appIcon, n.image
// n.actions — array of { id, label }
// n.invoke(actionId), n.dismiss()
// n.urgency — LOW / NORMAL / CRITICAL
// n.expireTimeout — ms until auto-dismiss (-1 = no timeout)
```

**Implementation notes:**
- `Astal.Window` per notification, anchored TOP | RIGHT, `layer = OVERLAY`
- Auto-dismiss after `n.expireTimeout` ms using `setTimeout`
- Stack multiple popups vertically with a gap
- Action buttons call `n.invoke(id)`

### B. histui Native Binding
Currently `Histui.tsx` polls `histui status --detailed` every 5s. histui should
grow a native GObject / D-Bus interface so we can bind to it reactively instead.

**Proposed interface (to implement in histui):**
- D-Bus service: `io.histui.Daemon`
- Properties: `count`, `missedCount`, `dndEnabled`, `class` (string)
- Signals: `notify::count`, `notify::dndEnabled`, `changed`
- Methods: `Toggle()`, `Dismiss(id)`, `GetHistory(since: string) → JSON`

**Bar widget (short term):** Keep polling `histui status --detailed` but increase
poll interval to 1s since the output is lightweight.

---

## Workspace Overview (Mission Control)

**Priority:** Medium  
**Library:** `gi://AstalHyprland`  
**Inspired by:** GNOME Activities overview, macOS Mission Control  

A full-screen overlay showing thumbnails of each workspace with its windows,
toggled by a keybind or clicking the workspaces widget.

**Key API:**
```ts
import Hyprland from "gi://AstalHyprland"
const hypr = Hyprland.get_default()
// hypr.workspaces — list of Workspace
// hypr.clients — list of Client
// client.workspace, client.address, client.title, client.class
// client.x, client.y, client.width, client.height
// client.focus()
// hypr.dispatch("workspace", id)
```

**Implementation notes:**
- `Astal.Window` with `exclusivity = IGNORE`, `layer = OVERLAY`, fullscreen
- Scale factor: render each workspace as a mini canvas at e.g. 0.15× scale
- `Gtk.DrawingArea` per workspace — draw window rectangles using Cairo
- Clicking a workspace thumbnail focuses it and hides the overlay
- Animate in/out with `Gtk.Revealer`
- Keybind integration: listen for Hyprland `submap` signal or use `ags request`

---

## OSD (On-Screen Display)

**Priority:** Medium  
**Libraries:** `gi://AstalWp` (volume), DBus/udev (brightness)  
**Inspired by:** Marble `OSD`, GNOME Shell volume/brightness OSD  

Floating indicator shown briefly when volume or brightness changes.

**Implementation notes:**
- Single `Astal.Window` anchored CENTER, `layer = OVERLAY`, auto-hides after 1.5s
- `Gtk.LevelBar` or `Gtk.ProgressBar` showing current value 0–100
- Icon changes by type: speaker / mic / brightness / keyboard backlight
- Triggered by listening to `notify::volume` on `AstalWp.Endpoint` and a brightness
  DBus property watcher

---

## App Launcher

**Priority:** Medium  
**Libraries:** `gi://AstalApps` or `gi://Gio` (desktop files)  
**Inspired by:** Marble `PickerModal`, GNOME app grid  

A search-driven app launcher popup.

**Key API:**
```ts
import Apps from "gi://AstalApps"
const apps = Apps.get_default()
// apps.list — list of Application
// app.name, app.description, app.iconName, app.frequency
// app.launch()
// apps.query(search) — fuzzy search returning Application[]
```

**Implementation notes:**
- `Astal.Window` centered, `layer = OVERLAY`
- `Gtk.SearchEntry` at the top
- Results in a `Gtk.FlowBox` (grid) or vertical list
- `createState("")` for search term, `createComputed` to filter `apps.list`
- Launch on Enter or click, then hide window
- Sort by `app.frequency` (most used first)

---

## Lock Screen

**Priority:** Low  
**Library:** `gi://AstalAuth` (PAM authentication)  
**Inspired by:** Marble `Lockscreen`  

**Key API:**
```ts
import Auth from "gi://AstalAuth"
const pam = new Auth.Pam()
// pam.connect("success", () => { /* unlock */ })
// pam.connect("error", (_, msg) => { /* show error */ })
// pam.authenticate(password)
```

**Implementation notes:**
- Requires `ext-session-lock-v1` Wayland protocol support — use
  `gtk4-session-lock` (`gi://Gtk4Sessionlock`)
- `Astal.Window` with session lock, full monitor coverage
- Background: blurred wallpaper screenshot or solid colour
- Clock label + date, `Gtk.PasswordEntry` for PIN/password
- Avatar from `/var/lib/AccountsService/icons/$USER`

---

## Weather Widget

**Priority:** Low  
**Library:** HTTP via `Soup` or `execAsync("curl ...")`  
**Data source:** wttr.in (no API key needed), e.g. `curl wttr.in/?format=j1`  

Small bar icon showing current conditions + temperature. Click opens a popover
with today's forecast.

**Implementation notes:**
- `createPoll` with 30-minute interval calling `curl 'wttr.in/?format=j1'`
- Parse JSON for `current_condition[0].temp_C`, `weatherCode`
- Map weather codes to Nerd Font icons (`nf-md-weather_*`)
- Popover shows hourly forecast for today

---

## System Monitor

**Priority:** Low  
**Libraries:** `/proc` parsing or `gi://GTop`  

CPU %, RAM used/total, optional temperature (from sysfs).

**Implementation notes:**
- `createPoll` every 2s reading `/proc/stat` for CPU and `/proc/meminfo` for RAM
- Temperature from `/sys/class/thermal/thermal_zone*/temp`
- Bar shows compact icon + percentage
- Popover shows per-core CPU bars + RAM breakdown

---

## Bar Corners

**Inspired by:** Marble `BarCorners`  

Decorative rounded corners below the bar that blend it into the desktop.
Two `Astal.Window` widgets (one per corner), each containing a `Gtk.DrawingArea`
that draws a quarter-circle fill matching `@background`.

**Implementation notes:**
- Anchor left window: `LEFT | TOP`, anchor right window: `RIGHT | TOP`
- Size: `r × r` pixels where `r` is the corner radius (e.g. 13px)
- `Cairo` drawing in `snapshot` override: fill corner cutout with `@background`

---

## References

- **Marble component toolkit:** https://marble-shell.pages.dev
- **Marble source (example shell):** https://github.com/Aylur/marble-shell
- **AGS v3 / Astal docs:** https://aylur.github.io/astal/
- **gnim reactive system:** `node_modules/gnim/dist/jsx/`
- **Astal GIR files:** `/usr/share/gir-1.0/Astal*.gir`
- **GNOME HIG:** https://developer.gnome.org/hig/
- **Nerd Font codepoints:** https://www.nerdfonts.com/cheat-sheet
