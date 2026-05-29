import { useState, useCallback, useRef } from 'react'
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
    badgeColor: '#4ade80',
    description: 'Lightweight & quick. Great for most images.',
    speed: '★★★★★',
    accuracy: '★★★☆☆',
  },
  {
    id: 'isnet-general-use',
    name: 'ISNet',
    badge: 'Balanced',
    badgeColor: '#60a5fa',
    description: 'Best balance of speed and precision.',
    speed: '★★★★☆',
    accuracy: '★★★★☆',
  },
  {
    id: 'birefnet-general',
    name: 'BiRefNet',
    badge: 'Best',
    badgeColor: '#a78bfa',
    description: 'State-of-the-art. Perfect for hair & fine details.',
    speed: '★★★☆☆',
    accuracy: '★★★★★',
  },
]

function App() {
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
      setProgress(p => Math.min(p + Math.random() * 15, 85))
    }, 400)

    try {
      const formData = new FormData()
      formData.append('file', originalFile)
      formData.append('model', selectedModel)
      formData.append('alpha_matting', alphaMatting.toString())

      const res = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Processing failed')
      }

      const blob = await res.blob()
      setResultUrl(URL.createObjectURL(blob))
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

  return (
    <div className="app">
      <Header />
      <main className="main">
        <div className="hero">
          <h1 className="hero-title">
            Remove Backgrounds
            <span className="gradient-text"> Instantly</span>
          </h1>
          <p className="hero-sub">
            Powered by three state-of-the-art AI models. Upload an image and get a transparent PNG in seconds.
          </p>
        </div>

        <div className="content-grid">
          <section className="panel controls-panel">
            <div className="panel-section">
              <label className="panel-label">AI Model</label>
              <ModelSelector
                models={MODELS}
                selected={selectedModel}
                onSelect={setSelectedModel}
              />
            </div>

            <div className="panel-section">
              <label className="panel-label">Options</label>
              <button
                className={`toggle-btn ${alphaMatting ? 'active' : ''}`}
                onClick={() => setAlphaMatting(v => !v)}
              >
                <span className="toggle-icon">{alphaMatting ? '✓' : '○'}</span>
                Alpha Matting
                <span className="toggle-hint">Improves hair & fur edges</span>
              </button>
            </div>

            {originalFile && !loading && (
              <div className="panel-section">
                <button className="btn-primary" onClick={handleRemoveBg}>
                  <span className="btn-icon">✦</span>
                  Remove Background
                </button>
              </div>
            )}

            {loading && (
              <div className="panel-section">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="progress-label">Processing with {MODELS.find(m => m.id === selectedModel)?.name}…</p>
              </div>
            )}

            {error && (
              <div className="error-box">
                <span className="error-icon">⚠</span>
                {error}
              </div>
            )}
          </section>

          <section className="panel upload-result-panel">
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

        <div className="models-info">
          <h2 className="section-title">About the Models</h2>
          <div className="models-grid">
            {MODELS.map(m => (
              <div key={m.id} className="model-card">
                <div className="model-card-header">
                  <span className="model-card-name">{m.name}</span>
                  <span className="model-card-badge" style={{ color: m.badgeColor, borderColor: m.badgeColor }}>
                    {m.badge}
                  </span>
                </div>
                <p className="model-card-desc">{m.description}</p>
                <div className="model-card-stats">
                  <div className="stat">
                    <span className="stat-label">Speed</span>
                    <span className="stat-stars">{m.speed}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Accuracy</span>
                    <span className="stat-stars">{m.accuracy}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App
