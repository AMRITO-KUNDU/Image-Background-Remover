import { useState, useCallback, useEffect } from 'react'
import Header from './components/Header'
import ModelSelector from './components/ModelSelector'
import UploadZone from './components/UploadZone'
import ResultPanel from './components/ResultPanel'
import Footer from './components/Footer'
import { CLIENT_MODEL_ID, CLIENT_MODEL_INFO } from './lib/clientSideRemover'
import { REMOVE_BG_MODEL } from './lib/serverApi'
import { getHfModelList } from './lib/hfSpaceApi'
import { useBackgroundRemoval } from './hooks/useBackgroundRemoval'
import './App.css'

const MODEL_STATS = {
  [CLIENT_MODEL_ID]: { speed: 95, quality: 78 },
  'remove.bg': { speed: 90, quality: 100 },
  u2net: { speed: 85, quality: 72 },
  u2netp: { speed: 95, quality: 60 },
  'isnet-general-use': { speed: 70, quality: 88 },
  'birefnet-general': { speed: 50, quality: 96 },
  silueta: { speed: 88, quality: 75 },
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

function buildModelList() {
  return [
    CLIENT_MODEL_INFO,
    { ...REMOVE_BG_MODEL },
    ...getHfModelList(),
  ]
}

export default function App() {
  const [models, setModels] = useState(buildModelList)
  const [selectedModel, setSelectedModel] = useState(CLIENT_MODEL_ID)
  const [alphaMatting, setAlphaMatting] = useState(false)
  const [originalFile, setOriginalFile] = useState(null)
  const [originalUrl, setOriginalUrl] = useState(null)
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('lbg-dark')
    if (saved !== null) return saved === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const { loading, progress, error, resultUrl, remove, reset, setError } = useBackgroundRemoval()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('lbg-dark', dark)
  }, [dark])

  // Rebuild list when env is available (HF URL)
  useEffect(() => {
    setModels(buildModelList())
  }, [])

  const handleModelSelect = useCallback(
    (id) => {
      const m = models.find((x) => x.id === id)
      if (m?.enabled === false) {
        setError(m.disabledReason || 'This model is currently disabled.')
        return
      }
      setSelectedModel(id)
      setError(null)
    },
    [models, setError]
  )

  const handleFileSelect = useCallback(
    (file) => {
      setOriginalFile(file)
      setOriginalUrl(URL.createObjectURL(file))
      reset()
    },
    [reset]
  )

  const handleRemoveBg = useCallback(async () => {
    if (!originalFile) return
    await remove(originalFile, { model: selectedModel, alphaMatting })
  }, [originalFile, selectedModel, alphaMatting, remove])

  const handleReset = useCallback(() => {
    setOriginalFile(null)
    setOriginalUrl(null)
    reset()
  }, [reset])

  const currentModel = models.find((m) => m.id === selectedModel)

  return (
    <div className="app">
      <Header dark={dark} onToggleDark={() => setDark((d) => !d)} />

      <main className="main">
        <div className="hero">
          <h1 className="hero-title">Remove image backgrounds</h1>
          <p className="hero-sub">
            Browser · remove.bg · U2-Net &amp; BiRefNet on Hugging Face — free &amp; unlimited options.
          </p>
        </div>

        <div className="workspace">
          <aside className="panel controls-panel">
            <div className="panel-section">
              <p className="label-sm">AI Model</p>
              <ModelSelector
                models={models}
                selected={selectedModel}
                onSelect={handleModelSelect}
              />
            </div>

            <div className="divider" />

            <div className="panel-section">
              <p className="label-sm">Options</p>
              <AlphaMattingToggle value={alphaMatting} onChange={setAlphaMatting} />
            </div>

            <div className="divider" />

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

          <div className="workspace-right">
            {error && (
              <div className="error-bar" role="alert">
                <span className="material-icons-round">error_outline</span>
                <span>{error}</span>
              </div>
            )}

            <section className="panel image-panel">
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

        <div className="model-strip">
          <h2 className="strip-title">Available models</h2>
          <div className="model-cards">
            {models
              .filter((m) => m.enabled !== false)
              .map((m) => {
                const s = MODEL_STATS[m.id]
                if (!s) return null
                const badgeClass =
                  m.badge === 'Cloud' ? 'cloud' : m.badge === 'Heavy' ? 'heavy' : 'local'
                return (
                  <div key={m.id} className="model-card">
                    <div className="model-card-header">
                      <span className="model-card-name">{m.name}</span>
                      <span className={`badge badge-${badgeClass}`}>{m.badge}</span>
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
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
