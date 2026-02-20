import app from "ags/gtk4/app"
import Adw from "gi://Adw"
import Gio from "gi://Gio"
import GLib from "gi://GLib"
import css from "./style/main.scss"
import config from "./config"
import Bar from "./widget/Bar"

// Colour scheme via libadwaita
const styleManager = Adw.StyleManager.get_default()
styleManager.colorScheme = {
  dark:  Adw.ColorScheme.PREFER_DARK,
  light: Adw.ColorScheme.PREFER_LIGHT,
  auto:  Adw.ColorScheme.DEFAULT,
}[config.colourScheme]

// Theme path
const themesDir = `${GLib.get_user_config_dir()}/ags/themes`
function themePath(): string {
  return `${themesDir}/${config.colours}.css`
}

// Apply styles
function applyTheme() {
  app.reset_css()
  app.apply_css(css)
  try {
    app.apply_css(themePath())
  } catch {
    console.warn(`[bar] theme not found: ${themePath()}`)
  }
}

// Hot-reload watcher
function watchTheme() {
  const file = Gio.File.new_for_path(themePath())
  const monitor = file.monitor_file(Gio.FileMonitorFlags.NONE, null)
  monitor.connect("changed", () => {
    console.log(`[bar] theme changed, reloading`)
    applyTheme()
  })
  return monitor
}

// Entry point
app.start({
  css,
  main() {
    applyTheme()
    const _monitor = watchTheme()

    const display = app.get_display()
    const monitors = display.get_monitors()
    for (let i = 0; i < monitors.get_n_items(); i++) {
      Bar(i)
    }
  },
})
