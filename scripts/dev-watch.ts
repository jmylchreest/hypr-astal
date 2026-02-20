#!/usr/bin/env bun
/**
 * dev-watch.ts — hot-restart dev script for hypr-astal
 *
 * Watches source files and restarts `ags run ./app.ts` on changes.
 * CSS-only changes in themes/ are handled by the in-app Gio.FileMonitor
 * without a full restart; all other source changes trigger a full restart.
 *
 * Usage:  bun run dev:watch
 */

import { watch } from "fs"
import { resolve, relative } from "path"
import { spawn, spawnSync } from "bun"

const ROOT = resolve(import.meta.dir, "..")

// Directories/files to watch for full restarts
const WATCH_PATHS = [
  "app.ts",
  "config.defaults.ts",
  "config.loader.ts",
  "layouts",
  "widget",
  "style",
]

// theme/ changes are handled by in-app hot-reload — no restart needed
const CSS_ONLY_DIRS = ["themes"]

let agsProc: ReturnType<typeof spawn> | null = null
let debounceTimer: Timer | null = null
let restarting = false

function log(msg: string) {
  const now = new Date().toLocaleTimeString("en-GB", { hour12: false })
  console.log(`[${now}] ${msg}`)
}

async function startAgs() {
  log("Starting ags run ./app.ts …")
  agsProc = spawn(["ags", "run", "./app.ts"], {
    cwd: ROOT,
    stdout: "inherit",
    stderr: "inherit",
    onExit(proc, exitCode, signalCode) {
      if (!restarting) {
        log(`ags exited (code=${exitCode ?? signalCode}). Waiting for file changes …`)
        agsProc = null
      }
    },
  })
}

async function restart(reason: string) {
  if (restarting) return
  restarting = true
  log(`Change detected: ${reason}`)

  // Ask the running instance to quit gracefully
  if (agsProc) {
    log("Stopping ags …")
    spawnSync(["ags", "quit"], { cwd: ROOT })

    // Give it up to 2s to exit cleanly, then kill
    const deadline = Date.now() + 2000
    while (agsProc && Date.now() < deadline) {
      await Bun.sleep(50)
    }
    if (agsProc) {
      agsProc.kill()
      agsProc = null
    }
  }

  restarting = false
  await startAgs()
}

function scheduleRestart(path: string) {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounceTimer = null
    restart(relative(ROOT, path))
  }, 300)
}

// Set up watchers
for (const rel of WATCH_PATHS) {
  const abs = resolve(ROOT, rel)
  try {
    watch(abs, { recursive: true }, (_event, filename) => {
      const full = filename ? resolve(abs, filename) : abs
      scheduleRestart(full)
    })
  } catch {
    // Path may not exist yet (e.g. config.ts is gitignored) — that's fine
  }
}

log(`Watching: ${WATCH_PATHS.join(", ")}`)
log(`Theme-only paths (in-app hot-reload, no restart): ${CSS_ONLY_DIRS.join(", ")}`)

// Handle Ctrl-C cleanly
process.on("SIGINT", () => {
  log("Shutting down …")
  if (agsProc) agsProc.kill()
  process.exit(0)
})

process.on("SIGTERM", () => {
  if (agsProc) agsProc.kill()
  process.exit(0)
})

// Start immediately
await startAgs()
