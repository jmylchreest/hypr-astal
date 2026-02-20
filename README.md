# hypr-astal

A GTK4/libadwaita desktop bar for Hyprland built with [AGS v3](https://github.com/Aylur/ags) and [Astal](https://github.com/Aylur/astal).

## Features

- **Config-driven widget placement** -- rearrange widgets by editing `config.ts`, no code changes needed
- **Hot-reloadable themes** -- drop a CSS file in `themes/` and changes apply instantly
- **Multiple layouts** -- top bar, bottom bar, vertical bar -- just add a layout file
- **GTK4 + libadwaita** -- modern rendering with colour scheme awareness

## Requirements

- [AGS](https://github.com/Aylur/ags) (aylurs-gtk-shell-git on AUR)
- [Astal libraries](https://github.com/Aylur/astal) (libastal-meta on AUR)
- [Bun](https://bun.sh) runtime
- GTK4, gtk4-layer-shell

Arch installation:
```bash
paru -S aylurs-gtk-shell-git libastal-meta
```

## Quick Start

```bash
# Clone the repo
git clone https://github.com/jmylchreest/hypr-astal.git
cd hypr-astal

# Install dependencies
bun install

# Generate TypeScript types
bun run types

# Run the bar
bun run dev
```

## Configuration

Copy `config.defaults.ts` to `config.ts` and edit:

```typescript
import defaults from "./config.defaults"
import type { Config } from "./config.defaults"

const config: Config = {
  ...defaults,
  layout: "default",           // Layout file to use
  colours: "default",          // Theme file (themes/{name}.css)
  colourScheme: "dark",        // "dark" | "light" | "auto"
  persistentWorkspaces: [1, 2, 3, 4, 5],

  // Widget placement -- ordered lists per slot
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

export default config
```

### Widget Placement

Widgets are defined by name in `start`, `centre`, and `end` arrays. Each name maps to a component in `widget/registry.ts`. Rearrange widgets by reordering the arrays.

Available widgets:
| Name | Description |
|------|-------------|
| `workspaces` | Hyprland workspace buttons |
| `submap` | Hyprland submap indicator |
| `clock` | Date/time display |
| `histui` | Notification status (histui integration) |
| `tray` | System tray |
| `idle-inhibitor` | Idle inhibitor toggle |
| `network` | WiFi/Ethernet status |
| `bluetooth` | Bluetooth status |
| `upower` | Battery status |
| `privacy` | Screen share/mic indicators |
| `audio-drawer` | Volume controls (expandable) |
| `power-drawer` | Power menu (expandable) |

## Themes

Drop a CSS file into `themes/` and set `colours` in config to the filename (without `.css`).

Theme files must define these 9 `@define-color` names:

| Name | Purpose |
|------|---------|
| `@background` | Bar/window background |
| `@foreground` | Primary text and icons |
| `@surface` | Elevated surfaces (pill groups) |
| `@outline` | Borders |
| `@accent` | Active/highlight colour |
| `@accent-fg` | Text on accent background |
| `@danger` | Destructive/urgent states |
| `@warning` | Warning states |
| `@success` | Success states |

Example minimal theme:
```css
@define-color background  #1e1e2e;
@define-color foreground  #cdd6f4;
@define-color surface     #313244;
@define-color outline     #45475a;
@define-color accent      #89b4fa;
@define-color accent-fg   #1e1e2e;
@define-color danger      #f38ba8;
@define-color warning     #f9e2af;
@define-color success     #a6e3a1;
```

### Theme Hot-Reload

Theme files are watched for changes. Editing `themes/your-theme.css` reloads styles instantly without restarting the bar.

### Override Structural Styles

Themes may optionally override any CSS from `style/main.scss`. Target widgets using the `.widget-{name}` class:

```css
/* Rounded corners on the audio drawer pill */
.widget-audio-drawer .pill-group {
  border-radius: 8px;
}

/* Custom animation on active workspace */
.widget-workspaces button.active {
  animation: pulse 1s ease infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

## Layouts

Layouts define bar positioning (anchor, orientation) only. Widget placement is handled by config.

To create a new layout:

1. Create `layouts/my-layout.ts`:

```typescript
import { Astal, Gtk } from "ags/gtk4"
import type { BarLayout } from "./types"

const layout: BarLayout = {
  anchor: Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT,
  layer: Astal.Layer.TOP,
  exclusivity: Astal.Exclusivity.EXCLUSIVE,
  orientation: Gtk.Orientation.HORIZONTAL,
}

export default layout
```

2. Register it in `layouts/index.ts`:

```typescript
import myLayout from "./my-layout"

const layouts: Record<string, BarLayout> = {
  default: defaultLayout,
  "my-layout": myLayout,
}
```

3. Set `layout: "my-layout"` in `config.ts`

## Adding Widgets

1. Create `widget/MyWidget.tsx`:

```typescript
export default function MyWidget() {
  return (
    <label class="bar-icon" label="Hello" />
  )
}
```

2. Register it in `widget/registry.ts`:

```typescript
import MyWidget from "./MyWidget"

const registry: Record<string, () => JSX.Element> = {
  // ... existing entries
  "my-widget": MyWidget,
}
```

3. Add `"my-widget"` to `start`, `centre`, or `end` in `config.ts`

4. Style it (optional) in your theme:

```css
.widget-my-widget {
  /* custom styles */
}
```

## Dotter Integration

For users of [dotter](https://github.com/SuperCuber/dotter), this repo can be a submodule:

```toml
# global.toml
[hyprland.files]
dot_config_ags = { target = "~/.config/ags/", type = "symbolic" }
dot_config_ags/config.ts = { type = "template", target = "~/.config/ags/config.ts" }

[hyprland.variables]
ags_layout = "default"
ags_colours = "default"
ags_colour_scheme = "auto"
```

```toml
# machine-specific.toml
ags_layout = "default"
ags_colours = "tinct"
ags_colour_scheme = "dark"
```

The `config.ts` template merges machine variables with defaults.

## License

MIT
