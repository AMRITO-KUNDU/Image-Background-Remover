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
      type="button"
    >
      <div className="alpha-toggle-track">
        <div className="alpha-toggle-thumb" />
      </div>
      <div className="alpha-toggle-info">
        <span className="alpha-toggle-label">Alpha Matting</span>
        <span className="alpha-toggle-sublabel">Recovers fine details like hair/fur edges</span>
      </div>
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

  // Brand and Theme Customization States
  const [theme, setTheme] = useState(() => localStorage.getItem('luminabg-theme') || 'dark-lumina')
  const [borderRadius, setBorderRadius] = useState(() => localStorage.getItem('luminabg-radius') || 'rounded-large')

  // Sync theme and border radius preferences
  useEffect(() => {
    const rootClasses = document.documentElement.classList
    
    // Clean up existing theme/radius classes
    rootClasses.forEach((cls) => {
      if (cls.startsWith('theme-') || cls.startsWith('radius-')) {
        rootClasses.remove(cls)
      }
    })

    // Apply new preferences
    rootClasses.add(`theme-${theme}`)

    const radiusMap = {
      'rounded-none': 'radius-none',
      'rounded-medium': 'radius-medium',
      'rounded-large': 'radius-large',
      'rounded-full': 'radius-full',
    }
    rootClasses.add(radiusMap[borderRadius] || 'radius-large')

    // Persist to local storage
    localStorage.setItem('luminabg-theme', theme)
    localStorage.setItem('luminabg-radius', borderRadius)
  }, [theme, borderRadius])

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
      {/* Decorative Blur Blobs */}
      <div className="glow-blob glow-blob-1"></div>
      <div className="glow-blob glow-blob-2"></div>

      <Header 
        theme={theme} 
        setTheme={setTheme}
        borderRadius={borderRadius}
        setBorderRadius={setBorderRadius}
      />

      <main className="main">
        {/* Premium Landing Hero */}
        <header className="hero">
          <div className="hero-eyebrow">
            <span className="material-icons-round">auto_awesome</span>
            AI-Powered Background Removal
          </div>
          <h1 className="hero-title">
            Remove backgrounds <span className="gradient-text font-bold">in seconds</span>
          </h1>
          <p className="hero-body">
            Professional-grade image background removal. Process locally in your browser with U2-Net, ISNet, and BiRefNet, or connect via cloud API.
          </p>
        </header>

        {/* Dashboard Grid */}
        <div className="content-grid">
          
          {/* Controls Column (Left) */}
          <aside className="glass-panel controls-panel">
            <div className="panel-section">
              <h2 className="section-label">Select AI Model</h2>
              <ModelSelector 
                models={models} 
                selected={selectedModel} 
                onSelect={handleModelSelect}
                onOpenMarketplace={() => setShowMarketplace(true)}
              />
            </div>

            <div className="panel-divider" />

            {/* Fine-tuning & Details */}
            <div className="panel-section">
              <h2 className="section-label">Tuning Options</h2>
              <AlphaMattingToggle value={alphaMatting} onChange={setAlphaMatting} />
            </div>

            <div className="panel-divider" />

            {/* Run Operations Block */}
            <div className="panel-section action-section">
              {originalFile && !loading && (
                <button
                  className="glow-btn full-width"
                  onClick={handleRemoveBg}
                  type="button"
                >
                  <span className="material-icons-round">auto_fix_high</span>
                  Remove Background
                </button>
              )}

              {!originalFile && (
                <div className="idle-controls-prompt">
                  <span className="material-icons-round prompt-icon">cloud_upload</span>
                  <p>Upload an image to start background removal</p>
                </div>
              )}
            </div>

            {/* Processing Progress */}
            {loading && (
              <div className="progress-section">
                <div className="linear-progress-bar">
                  <div className="linear-progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="progress-label">
                  Processing with <strong>{currentModel?.name || selectedModel}</strong>…
                </p>
              </div>
            )}
          </aside>

          {/* Results/Upload Column (Right) */}
          <div className="workspace-column">
            {error && (
              <div className="error-banner">
                <span className="material-icons-round">error_outline</span>
                <p>{error}</p>
              </div>
            )}

            <section className="glass-panel workspace-card">
              {!originalUrl ? (
                <UploadZone onFileSelect={handleFileSelect} />
              ) : (
                <ResultPanel
                  originalUrl={originalUrl}
                  resultUrl={resultUrl}
                  loading={loading}
                  onReset={handleReset}
                  fileName={originalFile?.name}
                />
              )}
            </section>
          </div>

        </div>

        {/* Informative model comparison grid */}
        <section className="models-info-section">
          <div className="section-header">
            <h2>Supported AI Engine Details</h2>
            <p>Our model registry allows you to scale the background removal accuracy based on local resource limits.</p>
          </div>

          <div className="models-info-grid">
            {models.filter(m => m.enabled !== false).map(m => {
              const stats = MODEL_STATS[m.id]
              if (!stats) return null
              const chipClass = m.id === 'remove.bg' ? 'api' : m.id === 'u2net' ? 'fast' : m.id === 'isnet-general-use' ? 'balanced' : 'best'
              return (
                <div key={m.id} className="info-card">
                  <div className="info-card-header">
                    <span className="info-card-name">{m.name}</span>
                    <span className={`badge-chip badge-${chipClass}`}>{m.badge}</span>
                  </div>
                  <p className="info-card-desc">{m.description}</p>
                  <div className="info-card-stats">
                    <div className="stat-row">
                      <span className="stat-name">Speed</span>
                      <div className="stat-meter-track">
                        <div className="stat-meter-fill fill-speed" style={{ width: `${stats.speed}%` }} />
                      </div>
                      <span className="stat-percentage">{stats.speed}%</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-name">Quality</span>
                      <div className="stat-meter-track">
                        <div className="stat-meter-fill fill-quality" style={{ width: `${stats.accuracy}%` }} />
                      </div>
                      <span className="stat-percentage">{stats.accuracy}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </main>

      <Footer />

      {/* Marketplace Registry Overlay */}
      {showMarketplace && (
        <Marketplace 
          onClose={() => setShowMarketplace(false)}
          onModelDownloaded={refreshModels}
        />
      )}
    </div>
  )
}
