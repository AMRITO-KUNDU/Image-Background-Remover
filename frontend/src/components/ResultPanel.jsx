import { useState } from 'react'
import './ResultPanel.css'

const BG_PRESETS = [
  { id: 'transparent', label: 'Transparent' },
  { id: 'white',       label: 'White',   color: '#ffffff' },
  { id: 'black',       label: 'Black',   color: '#000000' },
  { id: 'gray',        label: 'Gray',    color: '#6b7280' },
  { id: 'blue',        label: 'Blue',    color: '#2563eb' },
  { id: 'green',       label: 'Green',   color: '#16a34a' },
  { id: 'red',         label: 'Red',     color: '#dc2626' },
  { id: 'yellow',      label: 'Yellow',  color: '#ca8a04' },
  { id: 'purple',      label: 'Purple',  color: '#7c3aed' },
]

export default function ResultPanel({ originalUrl, resultUrl, loading, onReset, fileName }) {
  const [view, setView]           = useState('compare')   // 'compare' | 'result' | 'original'
  const [sliderPos, setSliderPos] = useState(50)
  const [bg, setBg]               = useState('transparent')

  /* Canvas-based download */
  const handleDownload = () => {
    if (!resultUrl) return
    const base = fileName?.replace(/\.[^/.]+$/, '') ?? 'image'

    if (bg === 'transparent') {
      const a = document.createElement('a')
      a.href = resultUrl
      a.download = `${base}_no_bg.png`
      a.click()
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = resultUrl
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      const ctx = c.getContext('2d')
      const preset = BG_PRESETS.find((p) => p.id === bg)
      ctx.fillStyle = preset?.color ?? '#ffffff'
      ctx.fillRect(0, 0, c.width, c.height)
      ctx.drawImage(img, 0, 0)
      const a = document.createElement('a')
      a.href = c.toDataURL('image/png')
      a.download = `${base}_bg_${bg}.png`
      a.click()
    }
  }

  const currentBg = BG_PRESETS.find((p) => p.id === bg)

  /* Inline style for result image background */
  const resultBgStyle = bg === 'transparent'
    ? {}
    : { backgroundColor: currentBg?.color }

  return (
    <div className="result-panel">

      {/* Tabs */}
      <div className="result-tabs">
        {[
          { id: 'compare',  label: 'Compare', icon: 'compare' },
          { id: 'result',   label: 'Result',  icon: 'auto_fix_high' },
          { id: 'original', label: 'Original', icon: 'photo' },
        ].map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${view === t.id ? 'active' : ''}`}
            onClick={() => setView(t.id)}
            type="button"
          >
            <span className="material-icons-round">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Viewport */}
      <div className="result-viewport">
        {loading ? (
          <div className="viewport-state">
            <span className="spinner" />
            <span className="state-text">Removing background…</span>
          </div>
        ) : (
          <>
            {/* Compare slider */}
            {view === 'compare' && (
              <div className="slider-root">
                {/* Original layer */}
                <img src={originalUrl} alt="Original" className="slider-layer" />

                {/* Result layer clipped */}
                <div
                  className={`slider-fg ${bg === 'transparent' ? 'checkerboard' : ''}`}
                  style={{
                    clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                    ...resultBgStyle,
                  }}
                >
                  <img
                    src={resultUrl || originalUrl}
                    alt="Result"
                    className="slider-layer"
                  />
                </div>

                {/* Divider */}
                <div className="slider-line" style={{ left: `${sliderPos}%` }}>
                  <div className="slider-handle">
                    <span className="material-icons-round">unfold_more</span>
                  </div>
                </div>

                {/* Invisible range input */}
                <input
                  type="range" min="0" max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="slider-input"
                  aria-label="Compare slider"
                />

                {/* Labels */}
                <span className="layer-label label-left">Before</span>
                <span className="layer-label label-right">After</span>
              </div>
            )}

            {/* Single views */}
            {view === 'result' && (
              <div className={`single-view ${bg === 'transparent' ? 'checkerboard' : ''}`} style={resultBgStyle}>
                {resultUrl
                  ? <img src={resultUrl} alt="Result" className="preview-img" />
                  : <div className="viewport-state">
                      <span className="material-icons-round state-icon">image_search</span>
                      <span className="state-text">Result will appear here</span>
                    </div>
                }
              </div>
            )}

            {view === 'original' && (
              <div className="single-view">
                <img src={originalUrl} alt="Original" className="preview-img" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom controls */}
      <div className="result-footer">
        {/* Background picker */}
        <div className="bg-picker">
          <span className="label-sm">Background</span>
          <div className="bg-dots">
            {BG_PRESETS.map((p) => (
              <button
                key={p.id}
                className={`bg-dot ${bg === p.id ? 'active' : ''} ${p.id === 'transparent' ? 'transparent-dot' : ''}`}
                style={p.color ? { backgroundColor: p.color } : {}}
                onClick={() => setBg(p.id)}
                title={p.label}
                type="button"
                aria-label={`Background: ${p.label}`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="result-actions">
          <button className="btn-ghost" onClick={onReset} type="button">
            <span className="material-icons-round">refresh</span>
            New image
          </button>
          {resultUrl && (
            <button className="btn-primary" onClick={handleDownload} type="button">
              <span className="material-icons-round">download</span>
              Download
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
