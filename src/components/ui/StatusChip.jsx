import { statusChipClass } from './statusClass'

export function StatusChip({ status }) {
  return <span className={statusChipClass(status)}>{status}</span>
}
