import { useState } from 'react'
import './ResultPanel.css'

const BACKGROUND_PRESETS = [
  { id: 'transparent', name: 'Transparent', class: 'checkerboard' },
  { id: 'white', name: 'White', color: '#ffffff' },
  { id: 'dark', name: 'Dark Slate', color: '#0f172a' },
  { id: 'blue', name: 'Ice Blue', color: '#3b82f6' },
  { id: 'emerald', name: 'Emerald', color: '#10b981' },
  { id: 'pink', name: 'Pastel Pink', color: '#f472b6' },
  { id: 'gradient-ocean', name: 'Ocean', gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
  { id: 'gradient-sunset', name: 'Sunset', gradient: 'linear-gradient(135deg, #f43f5e, #f97316)' },
  { id: 'gradient-cyber', name: 'Cyber', gradient: 'linear-gradient(135deg, #f43f5e, #6366f1)' },
  { id: 'gradient-space', name: 'Space', gradient: 'linear-gradient(135deg, #180f2b, #090514)' },
]

export default function ResultPanel({ originalUrl, resultUrl, loading, onReset, fileName }) {
  const [view, setView] = useState('split') // 'split' | 'result' | 'original'
  const [sliderPosition, setSliderPosition] = useState(50)
  const [bgPreset, setBgPreset] = useState('transparent')

  const handleDownload = () => {
    if (!resultUrl) return

    const base = fileName?.replace(/\.[^/.]+$/, '') || 'image'

    // If transparent background is selected, download directly to preserve native blob properties
    if (bgPreset === 'transparent') {
      const a = document.createElement('a')
      a.href = resultUrl
      a.download = `${base}_no_bg.png`
      a.click()
      return
    }

    // Otherwise, bake the selected color or gradient background into the output using HTML5 Canvas
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = resultUrl
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Render custom background on canvas
      const activePreset = BACKGROUND_PRESETS.find(p => p.id === bgPreset)
      if (activePreset) {
        if (activePreset.gradient) {
          // Draw gradient
          const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
          if (bgPreset === 'gradient-ocean') {
            grad.addColorStop(0, '#06b6d4')
            grad.addColorStop(1, '#3b82f6')
          } else if (bgPreset === 'gradient-sunset') {
            grad.addColorStop(0, '#f43f5e')
            grad.addColorStop(1, '#f97316')
          } else if (bgPreset === 'gradient-cyber') {
            grad.addColorStop(0, '#f43f5e')
            grad.addColorStop(1, '#6366f1')
          } else if (bgPreset === 'gradient-space') {
            grad.addColorStop(0, '#180f2b')
            grad.addColorStop(1, '#090514')
          } else {
            grad.addColorStop(0, '#000000')
            grad.addColorStop(1, '#ffffff')
          }
          ctx.fillStyle = grad
        } else {
          // Draw solid color
          ctx.fillStyle = activePreset.color || '#ffffff'
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Draw original transparent subject on top
      ctx.drawImage(img, 0, 0)

      // Download
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = `${base}_lumina.png`
      a.click()
    }
  }

  const TABS = [
    { id: 'original', label: 'Original', icon: 'photo' },
    { id: 'result', label: 'Result', icon: 'auto_fix_high' },
    { id: 'split', label: 'Compare Slider', icon: 'compare' },
  ]

  // Inline style builders for background presets
  const getPresetStyle = (preset) => {
    if (preset.gradient) {
      return { background: preset.gradient }
    }
    if (preset.color) {
      return { backgroundColor: preset.color }
    }
    return {} // transparent default checkerboard handled by class
  }

  const renderResultImage = () => {
    const activePreset = BACKGROUND_PRESETS.find(p => p.id === bgPreset)
    return (
      <img
        src={resultUrl}
        alt="Background Removed"
        className={`preview-img ${bgPreset === 'transparent' ? 'checkerboard' : ''}`}
        style={getPresetStyle(activePreset)}
      />
    )
  }

  return (
    <div className="result-panel">
      {/* Top Header Segmented Controls */}
      <div className="panel-header-actions">
        {resultUrl && (
          <div className="tab-segmented-control">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`tab-btn ${view === t.id ? 'active' : ''}`}
                onClick={() => setView(t.id)}
                type="button"
              >
                <span className="material-icons-round">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main image presentation viewport */}
      <div className="result-viewport">
        {loading ? (
          <div className="viewport-state-overlay">
            <div className="spinner-loader" />
            <p className="state-text">Removing background...</p>
          </div>
        ) : !resultUrl ? (
          <div className="viewport-state-overlay">
            <div className="spinner-loader" />
            <p className="state-text">Waiting for process request...</p>
          </div>
        ) : (
          <div className="image-view-container">
            {/* Split comparison view slider */}
            {view === 'split' && (
              <div className="slider-wrapper">
                {/* Background Image: Original */}
                <img src={originalUrl} alt="Original" className="slider-img original" />

                {/* Foreground Image: Output with clip path */}
                <div 
                  className={`slider-fg-container ${bgPreset === 'transparent' ? 'checkerboard' : ''}`}
                  style={{ 
                    clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                    ...getPresetStyle(BACKGROUND_PRESETS.find(p => p.id === bgPreset))
                  }}
                >
                  <img src={resultUrl} alt="Result" className="slider-img result" />
                </div>

                {/* Custom sliding line handle */}
                <div className="slider-divider-line" style={{ left: `${sliderPosition}%` }}>
                  <div className="slider-handle-node">
                    <span className="material-icons-round">unfold_more</span>
                  </div>
                </div>

                {/* Overlaid invisible input range range slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="slider-range-input"
                  aria-label="Before/After Compare Slider"
                />
              </div>
            )}

            {/* Normal original only view */}
            {view === 'original' && (
              <div className="single-viewport-container">
                <img src={originalUrl} alt="Original" className="preview-img" />
              </div>
            )}

            {/* Normal result only view */}
            {view === 'result' && (
              <div className="single-viewport-container">
                {renderResultImage()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Under viewport control panel: background changer, action buttons */}
      {resultUrl && !loading && (
        <div className="viewport-footer">
          {/* Background preset choices */}
          <div className="bg-changer-section">
            <span className="bg-changer-label">Preview Background</span>
            <div className="bg-presets-list">
              {BACKGROUND_PRESETS.map((p) => {
                const isSelected = bgPreset === p.id
                return (
                  <button
                    key={p.id}
                    className={`bg-preset-dot ${p.class || ''} ${isSelected ? 'active' : ''}`}
                    style={getPresetStyle(p)}
                    onClick={() => setBgPreset(p.id)}
                    title={p.name}
                    type="button"
                  />
                )
              })}
            </div>
          </div>

          <div className="action-row">
            <button className="outline-btn" onClick={onReset} type="button">
              <span className="material-icons-round">refresh</span>
              New Image
            </button>
            <button className="glow-btn" onClick={handleDownload} type="button">
              <span className="material-icons-round">download</span>
              Download Image
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
