import app from "ags/gtk4/app"
import Adw from "gi://Adw"
import Gio from "gi://Gio"
import GLib from "gi://GLib"
import css from "./style/main.css"
import { getConfig, loadUserConfig } from "./config.loader"
import Bar from "./widget/Bar"

// Entry point
app.start({
  css,
  async main() {
    // Load user config.ts if it exists (falls back to defaults)
    await loadUserConfig()
    const config = getConfig()

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

    applyTheme()
    const _monitor = watchTheme()

    const monitors = app.get_monitors()
    for (let i = 0; i < monitors.length; i++) {
      Bar(i)
    }
  },
})
