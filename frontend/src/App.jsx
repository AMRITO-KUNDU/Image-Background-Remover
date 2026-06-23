import { useState, useCallback, useEffect } from 'react'
import Header from './components/Header'
import ModelSelector from './components/ModelSelector'
import UploadZone from './components/UploadZone'
import ResultPanel from './components/ResultPanel'
import Footer from './components/Footer'
import Marketplace from './components/Marketplace'
import './App.css'

const MODELS = [
  {
    id: 'remove.bg',
    name: 'remove.bg API',
    badge: 'API',
    description: 'Cloud-based API service with excellent quality',
  },
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
  'remove.bg':        { speed: 95,  accuracy: 100 },
  'u2net':             { speed: 100, accuracy: 60 },
  'isnet-general-use': { speed: 80,  accuracy: 80 },
  'birefnet-general':  { speed: 55,  accuracy: 100 },
}

function AlphaMattingToggle({ value, onChange }) {
  return (
    <button
      className={`alpha-toggle ${value ? 'active' : ''}`}
      onClick={() => onChange(!value)}
    >
      <div className="alpha-toggle-track">
        <div className="alpha-toggle-thumb" />
      </div>
      <span className="alpha-toggle-label">Alpha matting</span>
    </button>
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

  useEffect(() => {
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        const apiModels = Object.entries(data.models || {}).map(([id, model]) => ({
          id,
          name: model.name,
          badge: model.type === 'api' ? 'API' : model.speed,
          description: model.description,
          enabled: model.enabled !== false,
          disabledReason: model.disabled_reason,
        }))
        if (apiModels.length) {
          setModels(apiModels)
          // Set default to remove.bg if available, otherwise first available model
          const removeBgModel = apiModels.find(m => m.id === 'remove.bg')
          if (removeBgModel && removeBgModel.enabled) {
            setSelectedModel('remove.bg')
          } else {
            const firstEnabled = apiModels.find(m => m.enabled !== false)
            if (firstEnabled) setSelectedModel(firstEnabled.id)
          }
        }
      })
      .catch(() => {
        // Keep bundled model metadata when the API is unavailable during local frontend-only dev.
      })
  }, [])

  const refreshModels = useCallback(() => {
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        const apiModels = Object.entries(data.models || {}).map(([id, model]) => ({
          id,
          name: model.name,
          badge: model.type === 'api' ? 'API' : model.speed,
          description: model.description,
          enabled: model.enabled !== false,
          disabledReason: model.disabled_reason,
        }))
        if (apiModels.length) {
          setModels(apiModels)
        }
      })
      .catch(() => {})
  }, [])

  const handleModelSelect = useCallback((modelId) => {
    const nextModel = models.find((model) => model.id === modelId)
    if (nextModel?.enabled === false) {
      setError(nextModel.disabledReason || 'This model is disabled on the current deployment.')
      return
    }
    setSelectedModel(modelId)
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

  const currentModel = models.find(m => m.id === selectedModel)

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
            Default: remove.bg API for excellent quality. Browse the marketplace for more local models.
          </p>
        </div>

        {/* Main two-column layout */}
        <div className="content-grid">

          {/* Left: Controls */}
          <aside className="md-card controls-panel">
            <div className="panel-section">
              <p className="section-label">AI Model</p>
              <ModelSelector 
                models={models} 
                selected={selectedModel} 
                onSelect={handleModelSelect}
                onOpenMarketplace={() => setShowMarketplace(true)}
              />
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
            {models.filter(m => m.enabled !== false).map(m => {
              const stats = MODEL_STATS[m.id]
              if (!stats) return null
              const chipClass = m.id === 'remove.bg' ? 'api' : m.id === 'u2net' ? 'fast' : m.id === 'isnet-general-use' ? 'balanced' : 'best'
              return (
                <div key={m.id} className="model-info-card">
                  <div className="model-info-header">
                    <span className="model-info-name">{m.name}</span>
                    <span className={`model-chip model-chip--${chipClass}`}>{m.badge}</span>
                  </div>
                  <p className="model-info-description">{m.description}</p>
                  <div className="model-info-stats">
                    <div className="stat-bar">
                      <span className="stat-label">Speed</span>
                      <div className="stat-track">
                        <div className="stat-fill" style={{ width: `${stats.speed}%` }} />
                      </div>
                    </div>
                    <div className="stat-bar">
                      <span className="stat-label">Accuracy</span>
                      <div className="stat-track">
                        <div className="stat-fill" style={{ width: `${stats.accuracy}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <Footer />

      {/* Marketplace Modal */}
      {showMarketplace && (
        <Marketplace 
          onClose={() => setShowMarketplace(false)}
          onModelDownloaded={refreshModels}
        />
      )}
    </div>
  )
}
