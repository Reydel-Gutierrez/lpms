import { priorityChipClass } from './statusClass'

export function PriorityChip({ priority }) {
  return <span className={priorityChipClass(priority)}>{priority}</span>
}
