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

  return (
    <div className="result-panel">
      {resultUrl && (
        <div className="result-tabs">
          {['original', 'result', 'split'].map((v) => (
            <button
              key={v}
              className={`tab ${view === v ? 'active' : ''}`}
              onClick={() => setView(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      )}

      <div className="result-images">
        {view === 'split' && (
          <div className="split-view">
            <div className="image-box">
              <span className="image-label">Original</span>
              <img src={originalUrl} alt="Original" className="preview-img" />
            </div>
            <div className="split-divider" />
            <div className="image-box">
              <span className="image-label">Result</span>
              {resultUrl ? (
                <img src={resultUrl} alt="Result" className="preview-img checkerboard" />
              ) : loading ? (
                <div className="loading-placeholder">
                  <div className="spinner" />
                  <span>Processing…</span>
                </div>
              ) : (
                <div className="empty-result">
                  <span>Click "Remove Background" to process</span>
                </div>
              )}
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
            {resultUrl ? (
              <img src={resultUrl} alt="Result" className="preview-img checkerboard" />
            ) : loading ? (
              <div className="loading-placeholder">
                <div className="spinner" />
                <span>Processing…</span>
              </div>
            ) : (
              <div className="empty-result">
                <span>No result yet</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="result-actions">
        <button className="btn-secondary" onClick={onReset}>
          New Image
        </button>
        {resultUrl && (
          <button className="btn-download" onClick={handleDownload}>
            Download PNG
          </button>
        )}
      </div>
    </div>
  )
}
