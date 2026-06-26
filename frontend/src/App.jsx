import { useState, useCallback, useEffect } from 'react'
import Header from './components/Header'
import ModelSelector from './components/ModelSelector'
import UploadZone from './components/UploadZone'
import ResultPanel from './components/ResultPanel'
import Footer from './components/Footer'
import Marketplace from './components/Marketplace'
import './App.css'

/* Only remove.bg + U2-Net (lightest local model: 176 MB, CPU-friendly) shown in UI.
   All heavier models live exclusively in the Marketplace. */
const MODELS = [
  {
    id: 'remove.bg',
    name: 'remove.bg API',
    badge: 'Cloud',
    description: 'Best quality via cloud API — requires API key',
    icon: 'cloud',
  },
  {
    id: 'u2net',
    name: 'U2-Net',
    badge: 'Local',
    description: 'Fastest local model — runs on 0.5 GB RAM',
    icon: 'memory',
  },
]

const MODEL_STATS = {
  'remove.bg': { speed: 92, quality: 100 },
  'u2net':     { speed: 100, quality: 65 },
}

function AlphaMattingToggle({ value, onChange }) {
  return (
    <label className="toggle-row">
      <span
        className={`toggle-switch ${value ? 'on' : ''}`}
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        tabIndex={0}
        onKeyDown={(e) => e.key === ' ' && onChange(!value)}
      >
        <span className="toggle-knob" />
      </span>
      <span className="toggle-label">
        Alpha matting
        <span className="toggle-hint">Better edge detail for hair &amp; fur</span>
      </span>
    </label>
  )
}

export default function App() {
  const [models, setModels] = useState(MODELS)
  const [selectedModel, setSelectedModel] = useState('remove.bg')
  const [alphaMatting, setAlphaMatting] = useState(false)
  const [originalFile, setOriginalFile] = useState(null)
  const [originalUrl, setOriginalUrl] = useState(null)
  const [resultUrl, setResultUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [showMarketplace, setShowMarketplace] = useState(false)
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('lbg-dark')
    if (saved !== null) return saved === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  /* Sync dark mode class */
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('lbg-dark', dark)
  }, [dark])

  /* Fetch real model list from API */
  useEffect(() => {
    fetch('/api/models')
      .then((r) => r.json())
      .then((data) => {
        // Only surface remove.bg and u2net to the main UI
        const MAIN_IDS = ['remove.bg', 'u2net']
        const apiModels = Object.entries(data.models || {})
          .filter(([id]) => MAIN_IDS.includes(id))
          .map(([id, m]) => ({
            id,
            name: m.name,
            badge: m.type === 'api' ? 'Cloud' : 'Local',
            description: m.description,
            icon: id === 'remove.bg' ? 'cloud' : 'memory',
            enabled: m.enabled !== false,
            disabledReason: m.disabled_reason,
          }))
        if (apiModels.length) {
          setModels(apiModels)
          const removeBg = apiModels.find((m) => m.id === 'remove.bg' && m.enabled)
          if (removeBg) {
            setSelectedModel('remove.bg')
          } else {
            const first = apiModels.find((m) => m.enabled !== false)
            if (first) setSelectedModel(first.id)
          }
        }
      })
      .catch(() => {})
  }, [])

  const refreshModels = useCallback(() => {
    fetch('/api/models')
      .then((r) => r.json())
      .then((data) => {
        const MAIN_IDS = ['remove.bg', 'u2net']
        const apiModels = Object.entries(data.models || {})
          .filter(([id]) => MAIN_IDS.includes(id))
          .map(([id, m]) => ({
            id,
            name: m.name,
            badge: m.type === 'api' ? 'Cloud' : 'Local',
            description: m.description,
            icon: id === 'remove.bg' ? 'cloud' : 'memory',
            enabled: m.enabled !== false,
            disabledReason: m.disabled_reason,
          }))
        if (apiModels.length) setModels(apiModels)
      })
      .catch(() => {})
  }, [])

  const handleModelSelect = useCallback((id) => {
    const m = models.find((x) => x.id === id)
    if (m?.enabled === false) {
      setError(m.disabledReason || 'This model is currently disabled.')
      return
    }
    setSelectedModel(id)
    setError(null)
  }, [models])

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
      setProgress((p) => Math.min(p + Math.random() * 10, 88))
    }, 400)

    try {
      const fd = new FormData()
      fd.append('file', originalFile)
      fd.append('model', selectedModel)
      fd.append('alpha_matting', alphaMatting.toString())

      const res = await fetch('/api/remove-background', { method: 'POST', body: fd })
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

  const currentModel = models.find((m) => m.id === selectedModel)

  return (
    <div className="app">
      <Header dark={dark} onToggleDark={() => setDark((d) => !d)} />

      <main className="main">
        {/* Page hero */}
        <div className="hero">
          <h1 className="hero-title">Remove image backgrounds</h1>
          <p className="hero-sub">
            Powered by U2-Net locally or remove.bg cloud API.
            No uploads stored, 100% private.
          </p>
        </div>

        {/* Two-column workspace */}
        <div className="workspace">

          {/* ── Left panel: controls ── */}
          <aside className="panel controls-panel">

            {/* Model selector */}
            <div className="panel-section">
              <p className="label-sm">AI Model</p>
              <ModelSelector
                models={models}
                selected={selectedModel}
                onSelect={handleModelSelect}
                onOpenMarketplace={() => setShowMarketplace(true)}
              />
            </div>

            <div className="divider" />

            {/* Options */}
            <div className="panel-section">
              <p className="label-sm">Options</p>
              <AlphaMattingToggle value={alphaMatting} onChange={setAlphaMatting} />
            </div>

            <div className="divider" />

            {/* Action / status */}
            <div className="panel-section">
              {originalFile && !loading && (
                <button className="btn-primary run-btn" onClick={handleRemoveBg}>
                  <span className="material-icons-round">auto_fix_high</span>
                  Remove Background
                </button>
              )}
              {!originalFile && (
                <p className="idle-hint">Upload an image to get started.</p>
              )}
            </div>

            {/* Progress */}
            {loading && (
              <div className="panel-section progress-area">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="progress-text">
                  Processing with {currentModel?.name}…
                </p>
              </div>
            )}
          </aside>

          {/* ── Right panel: upload / result ── */}
          <div className="workspace-right">
            {error && (
              <div className="error-bar" role="alert">
                <span className="material-icons-round">error_outline</span>
                <span>{error}</span>
              </div>
            )}

            <section className="panel image-panel">
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

        {/* Model info strip */}
        <div className="model-strip">
          <h2 className="strip-title">Available models</h2>
          <div className="model-cards">
            {models.filter((m) => m.enabled !== false).map((m) => {
              const s = MODEL_STATS[m.id]
              if (!s) return null
              return (
                <div key={m.id} className="model-card">
                  <div className="model-card-header">
                    <span className="model-card-name">{m.name}</span>
                    <span className={`badge badge-${m.id === 'remove.bg' ? 'cloud' : 'local'}`}>{m.badge}</span>
                  </div>
                  <p className="model-card-desc">{m.description}</p>
                  <div className="model-bars">
                    <div className="bar-row">
                      <span className="bar-label">Speed</span>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${s.speed}%` }} />
                      </div>
                    </div>
                    <div className="bar-row">
                      <span className="bar-label">Quality</span>
                      <div className="bar-track">
                        <div className="bar-fill bar-fill-alt" style={{ width: `${s.quality}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Marketplace CTA card */}
            <div
              className="model-card model-card-cta"
              onClick={() => setShowMarketplace(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setShowMarketplace(true)}
            >
              <span className="material-icons-round cta-icon">storefront</span>
              <p className="model-card-name">More models</p>
              <p className="model-card-desc">Browse ISNet, BiRefNet, MODNet and more in the marketplace.</p>
              <span className="cta-link">Open Marketplace →</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {showMarketplace && (
        <Marketplace
          onClose={() => setShowMarketplace(false)}
          onModelDownloaded={refreshModels}
        />
      )}
    </div>
  )
}
