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
          <h1 className="hero-title">Free AI background remover</h1>
          <p className="hero-sub">
            Remove an image background with an engine you choose: process it on your device, or use a cloud model. Compare the cutout and export a transparent PNG.
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
                  m.badge === 'Cloud'
                    ? 'cloud'
                    : m.badge === 'Experimental'
                      ? 'experimental'
                      : m.badge === 'Heavy'
                        ? 'heavy'
                        : 'local'
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

        <section className="info-section" id="how-it-works" aria-labelledby="how-it-works-title">
          <p className="label-sm">A simple three-step workflow</p>
          <h2 className="info-title" id="how-it-works-title">From photo to clean cutout</h2>
          <ol className="steps-list">
            <li className="step-card">
              <span className="step-number">01</span>
              <h3>Upload your image</h3>
              <p>Choose a JPEG, PNG, WebP, or GIF file up to 20 MB, or drag it into the upload area.</p>
            </li>
            <li className="step-card">
              <span className="step-number">02</span>
              <h3>Pick an engine</h3>
              <p>Use Browser for on-device processing, or select a configured cloud model when you want to compare its result.</p>
            </li>
            <li className="step-card">
              <span className="step-number">03</span>
              <h3>Compare and export</h3>
              <p>Review the original and cutout, preview a background color, and download the result as a PNG.</p>
            </li>
          </ol>
          <p className="info-link"><a href="/how-to-remove-image-background.html">Read the full background-removal guide <span aria-hidden="true">&rarr;</span></a></p>
        </section>

        <section className="faq-section" id="faq" aria-labelledby="faq-title">
          <p className="label-sm">Good to know</p>
          <h2 className="info-title" id="faq-title">Background remover FAQs</h2>
          <div className="faq-list">
            <details className="faq-item">
              <summary>Can I remove a background without uploading the image?</summary>
              <p>The Browser engine runs on your device and does not send the original image to LuminaBG's processing endpoint. The remove.bg and Hugging Face engines send the image to the selected remote provider.</p>
            </details>
            <details className="faq-item">
              <summary>Is LuminaBG free to use?</summary>
              <p>The Browser engine is free to run and does not need a cloud API key. Optional cloud engines can have provider-specific setup, quotas, or terms.</p>
            </details>
            <details className="faq-item">
              <summary>What image files can I use?</summary>
              <p>Upload JPEG, PNG, WebP, or GIF images up to 20 MB. The result downloads as a PNG.</p>
            </details>
            <details className="faq-item">
              <summary>Where can I read more about image privacy?</summary>
              <p>See <a href="/privacy.html">how each processing engine handles your image</a> before choosing a local or cloud option.</p>
            </details>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
