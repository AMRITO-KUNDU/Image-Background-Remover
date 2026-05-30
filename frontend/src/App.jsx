import { useState, useCallback } from 'react'
import Header from './components/Header'
import ModelSelector from './components/ModelSelector'
import UploadZone from './components/UploadZone'
import ResultPanel from './components/ResultPanel'
import Footer from './components/Footer'
import './App.css'

const MODELS = [
  {
    id: 'u2net',
    name: 'U2-Net',
    badge: 'Fast',
    description: 'Quick & lightweight for most images',
  },
  {
    id: 'isnet-general-use',
    name: 'ISNet',
    badge: 'Balanced',
    description: 'Best mix of speed and precision',
  },
  {
    id: 'birefnet-general',
    name: 'BiRefNet',
    badge: 'Best',
    description: 'State-of-the-art, ideal for hair & fur',
  },
]

const MODEL_STATS = {
  'u2net':             { speed: 100, accuracy: 60 },
  'isnet-general-use': { speed: 80,  accuracy: 80 },
  'birefnet-general':  { speed: 55,  accuracy: 100 },
}

export default function App() {
  const [selectedModel, setSelectedModel] = useState('u2net')
  const [alphaMatting, setAlphaMatting] = useState(false)
  const [originalFile, setOriginalFile] = useState(null)
  const [originalUrl, setOriginalUrl] = useState(null)
  const [resultUrl, setResultUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  const handleFileSelect = useCallback((file) => {
    setOriginalFile(file)
    setOriginalUrl(URL.createObjectURL(file))
    setResultUrl(null)
    setError(null)
  }, [])

  const handleRemoveBg = useCallback(async () => {
    if (!originalFile) return
    setLoading(true)
    setError(null)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 12, 85))
    }, 350)

    try {
      const formData = new FormData()
      formData.append('file', originalFile)
      formData.append('model', selectedModel)
      formData.append('alpha_matting', alphaMatting.toString())

      const res = await fetch('/api/remove-background', { method: 'POST', body: formData })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Processing failed')
      }

      setResultUrl(URL.createObjectURL(await res.blob()))
      setProgress(100)
    } catch (e) {
      setError(e.message)
    } finally {
      clearInterval(interval)
      setLoading(false)
    }
  }, [originalFile, selectedModel, alphaMatting])

  const handleReset = useCallback(() => {
    setOriginalFile(null)
    setOriginalUrl(null)
    setResultUrl(null)
    setError(null)
    setProgress(0)
  }, [])

  const currentModel = MODELS.find(m => m.id === selectedModel)

  return (
    <div className="app">
      <Header />

      <main className="main">
        {/* Hero */}
        <div className="hero">
          <div className="hero-eyebrow">
            <span className="material-icons-round" style={{ fontSize: 16 }}>auto_awesome</span>
            AI-Powered Background Removal
          </div>
          <h1 className="hero-title">
            Remove backgrounds<br /><strong>in seconds</strong>
          </h1>
          <p className="hero-body">
            Three state-of-the-art models. Upload an image, choose your model, and download a perfect transparent PNG — no signup required.
          </p>
        </div>

        {/* Main two-column layout */}
        <div className="content-grid">

          {/* Left: Controls */}
          <aside className="md-card controls-panel">
            <div className="panel-section">
              <p className="section-label">AI Model</p>
              <ModelSelector models={MODELS} selected={selectedModel} onSelect={setSelectedModel} />
            </div>

            <div className="panel-divider" />

            {/* Alpha matting toggle */}
            <div className="panel-section">
              <p className="section-label">Options</p>
              <AlphaMattingToggle value={alphaMatting} onChange={setAlphaMatting} />
            </div>

            <div className="panel-divider" />

            {/* Action button */}
            <div className="panel-section" style={{ paddingBottom: 24 }}>
              {originalFile && !loading && (
                <button
                  className="md-btn-filled"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={handleRemoveBg}
                >
                  <span className="material-icons-round">auto_fix_high</span>
                  Remove Background
                </button>
              )}

              {!originalFile && (
                <p style={{
                  fontSize: 'var(--md-typescale-body-small)',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  textAlign: 'center',
                  lineHeight: 1.6,
                }}>
                  Upload an image to get started
                </p>
              )}
            </div>

            {/* Progress */}
            {loading && (
              <div className="progress-section">
                <div className="md-linear-progress">
                  <div className="md-linear-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="progress-label">Processing with {currentModel?.name}…</p>
              </div>
            )}
          </aside>

          {/* Error banner outside panel so it spans */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {error && (
              <div className="md-error-banner">
                <span className="material-icons-round">error_outline</span>
                <p>{error}</p>
              </div>
            )}

            {/* Right: Upload / Result */}
            <section className="md-card upload-result-panel">
              {!originalUrl
                ? <UploadZone onFileSelect={handleFileSelect} />
                : <ResultPanel
                    originalUrl={originalUrl}
                    resultUrl={resultUrl}
                    loading={loading}
                    onReset={handleReset}
                    fileName={originalFile?.name}
                  />
              }
            </section>
          </div>
        </div>

        {/* Model info cards */}
        <section className="models-section">
          <div className="section-header">
            <h2>About the models</h2>
            <p>Each model is optimised for different use cases. Choose based on your needs.</p>
          </div>

          <div className="models-grid">
            {MODELS.map(m => {
              const stats = MODEL_STATS[m.id]
              const chipClass = m.id === 'u2net' ? 'fast' : m.id === 'isnet-general-use' ? 'balanced' : 'best'
              return (
                <div key={m.id} className="model-info-card">
                  <div className="model-info-header">
                    <span className="model-info-name">{m.name}</span>
                    <span className={`model-chip model-chip--${chipClass}`}>{m.badge}</span>
                  </div>
                  <p className="model-info-desc">{m.description}</p>
                  <div className="model-stats">
                    <div className="model-stat-row">
                      <span className="model-stat-label">Speed</span>
                      <div className="model-stat-bar-wrap">
                        <div className="model-stat-bar" style={{ width: `${stats.speed}%` }} />
                      </div>
                      <span className="model-stat-value">{stats.speed}%</span>
                    </div>
                    <div className="model-stat-row">
                      <span className="model-stat-label">Accuracy</span>
                      <div className="model-stat-bar-wrap">
                        <div className="model-stat-bar" style={{ width: `${stats.accuracy}%`, background: 'var(--md-sys-color-tertiary)' }} />
                      </div>
                      <span className="model-stat-value">{stats.accuracy}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function AlphaMattingToggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(v => !v)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        width: '100%',
        padding: '14px 16px',
        border: `1px solid ${value ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline-variant)'}`,
        borderRadius: 'var(--md-shape-corner-medium)',
        background: value ? 'var(--md-sys-color-primary-container)' : 'transparent',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 200ms cubic-bezier(0.2,0,0,1)',
      }}
    >
      {/* M3-style switch */}
      <div style={{
        width: 52,
        height: 32,
        borderRadius: 'var(--md-shape-corner-full)',
        background: value ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-surface-container-highest)',
        border: value ? 'none' : '2px solid var(--md-sys-color-outline)',
        position: 'relative',
        flexShrink: 0,
        transition: 'all 200ms',
      }}>
        <div style={{
          position: 'absolute',
          top: value ? 4 : 6,
          left: value ? 24 : 6,
          width: value ? 24 : 16,
          height: value ? 24 : 16,
          borderRadius: '50%',
          background: value ? 'var(--md-sys-color-on-primary)' : 'var(--md-sys-color-outline)',
          transition: 'all 200ms cubic-bezier(0.2,0,0,1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {value && (
            <span className="material-icons-round" style={{ fontSize: 14, color: 'var(--md-sys-color-primary)' }}>check</span>
          )}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: 'var(--md-typescale-body-medium)',
          fontWeight: 500,
          color: value ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface)',
          marginBottom: 2,
        }}>
          Alpha Matting
        </p>
        <p style={{
          fontSize: 'var(--md-typescale-body-small)',
          color: value ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-surface-variant)',
        }}>
          Refines hair and fur edges
        </p>
      </div>
    </button>
  )
}
