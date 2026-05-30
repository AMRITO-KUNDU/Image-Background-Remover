import { useState } from 'react'
import './ResultPanel.css'

export default function ResultPanel({ originalUrl, resultUrl, loading, onReset, fileName }) {
  const [view, setView] = useState('split')

  const handleDownload = () => {
    if (!resultUrl) return
    const a = document.createElement('a')
    a.href = resultUrl
    const base = fileName?.replace(/\.[^/.]+$/, '') || 'image'
    a.download = `${base}_no_bg.png`
    a.click()
  }

  const TABS = [
    { id: 'original', label: 'Original', icon: 'photo' },
    { id: 'result', label: 'Result', icon: 'auto_fix_high' },
    { id: 'split', label: 'Compare', icon: 'compare' },
  ]

  const renderImage = (url, transparent = false) => (
    url
      ? <img src={url} alt={transparent ? 'Result' : 'Original'} className={`preview-img ${transparent ? 'checkerboard' : ''}`} />
      : loading
        ? <div className="state-placeholder"><div className="md-circular-progress" /><p>Removing background…</p></div>
        : <div className="state-placeholder"><span className="material-icons-round">image_search</span><p>Result will appear here</p></div>
  )

  return (
    <div className="result-panel">
      {resultUrl && (
        <div className="md-segmented-btn">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`seg-btn ${view === t.id ? 'active' : ''}`}
              onClick={() => setView(t.id)}
            >
              <span className="material-icons-round">{view === t.id ? 'check' : t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div className="result-images">
        {view === 'split' && (
          <div className="split-view">
            <div className="image-column">
              <span className="image-column-label">Original</span>
              <img src={originalUrl} alt="Original" className="preview-img" />
            </div>
            <div className="image-column">
              <span className="image-column-label">Result</span>
              {renderImage(resultUrl, true)}
            </div>
          </div>
        )}
        {view === 'original' && (
          <div className="single-view">
            <img src={originalUrl} alt="Original" className="preview-img" />
          </div>
        )}
        {view === 'result' && (
          <div className="single-view">
            {renderImage(resultUrl, true)}
          </div>
        )}
      </div>

      <div className="result-actions">
        <button className="md-btn-text" onClick={onReset}>
          <span className="material-icons-round">refresh</span>
          New image
        </button>
        {resultUrl && (
          <button className="md-btn-filled" onClick={handleDownload}>
            <span className="material-icons-round">download</span>
            Download PNG
          </button>
        )}
      </div>
    </div>
  )
}
