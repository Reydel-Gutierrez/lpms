import { useEffect } from 'react'

export function Modal({ title, children, footer, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="lpms-modal-overlay" role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="lpms-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="lpms-modal-head">
          <h2>{title}</h2>
          <button type="button" className="lpms-btn ghost sm" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="lpms-modal-body">{children}</div>
        {footer != null && <div className="lpms-modal-foot">{footer}</div>}
      </div>
    </div>
  )
}
