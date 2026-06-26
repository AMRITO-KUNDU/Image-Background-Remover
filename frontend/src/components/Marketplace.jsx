import { useState, useEffect, useCallback } from 'react'
import './Marketplace.css'

export default function Marketplace({ onClose, onModelDownloaded }) {
  const [models, setModels]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [downloading, setDownloading] = useState({})
  const [error, setError]           = useState(null)
  const [query, setQuery]           = useState('')

  useEffect(() => { fetchModels() }, [])

  const fetchModels = async () => {
    try {
      const res  = await fetch('/api/marketplace')
      const data = await res.json()
      /* Exclude the 2 main UI models — user already sees them */
      const HIDDEN = ['remove.bg']
      setModels(
        Object.entries(data.models || {})
          .filter(([id]) => !HIDDEN.includes(id))
          .map(([id, m]) => ({ id, ...m }))
      )
      setLoading(false)
    } catch {
      setError('Could not load the marketplace — check backend connectivity.')
      setLoading(false)
    }
  }

  const handleDownload = useCallback(async (modelId) => {
    setDownloading((d) => ({ ...d, [modelId]: true }))
    setError(null)
    try {
      const res  = await fetch(`/api/marketplace/${modelId}/download`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Download failed')
      if (onModelDownloaded) onModelDownloaded()
      alert(data.message)
    } catch (e) {
      setError(e.message)
    } finally {
      setDownloading((d) => ({ ...d, [modelId]: false }))
    }
  }, [onModelDownloaded])

  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const filtered = models.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.description.toLowerCase().includes(query.toLowerCase())
  )

  const speedColor = (s) => ({
    'Very Fast': '#16a34a',
    'Fast': '#16a34a',
    'Medium': '#d97706',
    'Slower': '#dc2626',
  }[s] ?? '#6b7280')

  return (
    <div className="mp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mp-modal" role="dialog" aria-modal="true" aria-label="Model Marketplace">

        {/* Header */}
        <div className="mp-header">
          <div>
            <h2 className="mp-title">Model Marketplace</h2>
            <p className="mp-sub">Download additional AI models to run locally</p>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="mp-search-wrap">
          <span className="material-icons-round mp-search-icon">search</span>
          <input
            className="mp-search"
            type="text"
            placeholder="Search models…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="error-bar" style={{ marginBottom: 12 }}>
            <span className="material-icons-round">error_outline</span>
            <span>{error}</span>
          </div>
        )}

        {/* Body */}
        <div className="mp-body">
          {loading ? (
            <div className="mp-state">
              <span className="spinner" />
              <span>Loading marketplace…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="mp-state">
              <span className="material-icons-round" style={{ fontSize: 32, marginBottom: 8 }}>search_off</span>
              <span>No models match "{query}"</span>
            </div>
          ) : (
            <div className="mp-grid">
              {filtered.map((m) => {
                const busy = downloading[m.id]
                return (
                  <div key={m.id} className="mp-card">
                    <div className="mp-card-top">
                      <div>
                        <p className="mp-model-name">{m.name}</p>
                        <p className="mp-model-desc">{m.description}</p>
                      </div>
                      <span className={`badge ${m.type === 'builtin' ? 'badge-local' : 'badge-cloud'}`}>
                        {m.type === 'builtin' ? 'Local' : 'External'}
                      </span>
                    </div>

                    <div className="mp-meta">
                      <span className="mp-stat">
                        <span className="mp-stat-label">Speed</span>
                        <span className="mp-stat-val" style={{ color: speedColor(m.speed) }}>{m.speed}</span>
                      </span>
                      <span className="mp-sep" />
                      <span className="mp-stat">
                        <span className="mp-stat-label">Quality</span>
                        <span className="mp-stat-val">{m.accuracy}</span>
                      </span>
                      {m.size_mb && (
                        <>
                          <span className="mp-sep" />
                          <span className="mp-stat">
                            <span className="mp-stat-label">Size</span>
                            <span className="mp-stat-val">{m.size_mb} MB</span>
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      className="btn-primary mp-dl-btn"
                      onClick={() => handleDownload(m.id)}
                      disabled={busy}
                      type="button"
                    >
                      {busy ? (
                        <><span className="spinner" style={{ width: 14, height: 14 }} /> Downloading…</>
                      ) : (
                        <><span className="material-icons-round">download</span>
                          {m.type === 'builtin' ? 'Load model' : 'Download'}
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="mp-footer-note">
          <span className="material-icons-round">info</span>
          Heavy models (ISNet, BiRefNet) require &gt;512 MB RAM. Use U2-Net on Render free tier.
        </div>
      </div>
    </div>
  )
}
