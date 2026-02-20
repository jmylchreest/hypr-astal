import registry from "./registry"

type SlotProps = {
  widgets: string[]
  spacing?: number
}

export default function SlotRenderer({ widgets, spacing = 2 }: SlotProps) {
  return (
    <box spacing={spacing}>
      {widgets.map((name) => {
        const Widget = registry[name]
        if (!Widget) {
          console.warn(`[bar] unknown widget: "${name}"`)
          return null
        }
        return (
          <box class={`widget-${name}`}>
            <Widget />
          </box>
        )
      })}
    </box>
  )
}
