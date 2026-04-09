import { useEffect } from 'react'

export function Drawer({ open, title, subtitle, onClose, children, wide = false }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="lpms-drawer-overlay"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <aside
        className={`lpms-drawer${wide ? ' lpms-drawer--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lpms-drawer-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="lpms-drawer-head">
          <div className="lpms-drawer-head-text">
            <h2 id="lpms-drawer-title">{title}</h2>
            {subtitle && <p className="lpms-drawer-sub">{subtitle}</p>}
          </div>
          <button type="button" className="lpms-btn ghost sm" onClick={onClose} aria-label="Close panel">
            ✕
          </button>
        </header>
        <div className="lpms-drawer-body">{children}</div>
      </aside>
    </div>
  )
}
