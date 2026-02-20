import { getConfig } from "../config.loader"
import defaultLayout from "./default"
import type { BarLayout } from "./types"

const config = getConfig()

const layouts: Record<string, BarLayout> = {
  default: defaultLayout,
}

const layout: BarLayout = layouts[config.layout] ?? defaultLayout
export default layout
