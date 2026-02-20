import config from "../config"
import defaultLayout from "./default"
import type { BarLayout } from "./types"

const layouts: Record<string, BarLayout> = {
  default: defaultLayout,
}

const layout: BarLayout = layouts[config.layout] ?? defaultLayout
export default layout
