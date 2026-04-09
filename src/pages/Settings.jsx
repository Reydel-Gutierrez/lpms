import { useRef, useState } from 'react'
import { useAppState } from '../context/AppStateContext'

export function Settings() {
  const { resetDemoData, exportState, importState } = useAppState()
  const fileRef = useRef(null)
  const [msg, setMsg] = useState(null)

  const download = () => {
    const blob = new Blob([exportState()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `lpms-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMsg('Export downloaded.')
    setTimeout(() => setMsg(null), 3000)
  }

  const onFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importState(reader.result)
        setMsg('Import successful. Reload if anything looks off.')
      } catch (err) {
        setMsg(String(err.message || err))
      }
      e.target.value = ''
    }
    reader.readAsText(f)
  }

  return (
    <div className="lpms-page">
      <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.65rem', fontWeight: 800 }}>Data</h1>
      <p style={{ margin: '0 0 1.5rem', color: 'var(--text-muted)', maxWidth: '40rem' }}>
        LPMS stores everything in your browser (localStorage). Export regularly if you care about the dataset.
      </p>

      <div className="lpms-card" style={{ maxWidth: '560px' }}>
        <div className="lpms-card-header">
          <h3 className="lpms-card-title">Backup & restore</h3>
        </div>
        <div className="lpms-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button type="button" className="lpms-btn primary" onClick={download}>
            Export JSON
          </button>
          <div>
            <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={onFile} />
            <button type="button" className="lpms-btn" onClick={() => fileRef.current?.click()}>
              Import JSON
            </button>
          </div>
          {msg && <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent)' }}>{msg}</p>}
        </div>
      </div>

      <div className="lpms-card" style={{ maxWidth: '560px', marginTop: '1.25rem', borderColor: 'rgba(248, 113, 113, 0.25)' }}>
        <div className="lpms-card-header">
          <h3 className="lpms-card-title">Danger zone</h3>
        </div>
        <div className="lpms-card-body">
          <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Reset replaces all local data with the built-in demo workspaces. Your current data will be lost unless you exported it.
          </p>
          <button
            type="button"
            className="lpms-btn danger"
            onClick={() => {
              if (window.confirm('Reset to demo data? Current local data will be replaced.')) {
                resetDemoData()
                setMsg('Demo data restored.')
                setTimeout(() => setMsg(null), 3000)
              }
            }}
          >
            Reset to demo data
          </button>
        </div>
      </div>
    </div>
  )
}
