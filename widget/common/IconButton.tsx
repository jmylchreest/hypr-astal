import GLib from "gi://GLib"

type IconButtonProps = {
  icon: string
  tooltip?: string
  class?: string
  onClick?: () => void
  onMiddleClick?: () => void
  onRightClick?: () => void
  command?: string
}

export default function IconButton({
  icon,
  tooltip,
  class: extraClass,
  onClick,
  onMiddleClick,
  onRightClick,
  command,
}: IconButtonProps) {
  function handleClick(btn: number) {
    if (btn === 1) {
      if (onClick) onClick()
      else if (command) GLib.spawn_command_line_async(command)
    }
    if (btn === 2 && onMiddleClick) onMiddleClick()
    if (btn === 3 && onRightClick) onRightClick()
  }

  return (
    <button
      class={`bar-icon${extraClass ? ` ${extraClass}` : ""}`}
      tooltipText={tooltip ?? ""}
      hasTooltip={!!tooltip}
      onButtonReleased={(_, event) => handleClick(event.get_button())}
    >
      <label label={icon} />
    </button>
  )
}
