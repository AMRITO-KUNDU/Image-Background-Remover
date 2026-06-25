import { useState, useEffect } from 'react'
import './Marketplace.css'

export default function Marketplace({ onClose, onModelDownloaded }) {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState({})
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchMarketplaceModels()
  }, [])

  const fetchMarketplaceModels = async () => {
    try {
      const res = await fetch('/api/marketplace')
      const data = await res.json()
      setModels(Object.entries(data.models || {}).map(([id, model]) => ({
        id,
        ...model
      })))
      setLoading(false)
    } catch {
      setError('Failed to load marketplace models from host server.')
      setLoading(false)
    }
  }

  const handleDownload = async (modelId) => {
    setDownloading(prev => ({ ...prev, [modelId]: true }))
    setError(null)

    try {
      const res = await fetch(`/api/marketplace/${modelId}/download`, { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Download operation failed.')
      }

      if (onModelDownloaded) {
        onModelDownloaded()
      }

      alert(`${data.message}`)
    } catch (e) {
      setError(e.message)
    } finally {
      setDownloading(prev => ({ ...prev, [modelId]: false }))
    }
  }

  const getSpeedBadge = (speed) => {
    const speedClass = {
      'Very Fast': 'very-fast',
      'Fast': 'fast',
      'Medium': 'medium',
      'Slower': 'slow'
    }[speed] || 'medium'
    return speedClass
  }

  const getAccuracyBadge = (accuracy) => {
    const accuracyClass = {
      'Excellent': 'excellent',
      'Best': 'best',
      'High': 'high',
      'Good': 'good',
      'Medium': 'medium'
    }[accuracy] || 'medium'
    return accuracyClass
  }

  const filteredModels = models.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="marketplace-overlay">
      <div className="marketplace-modal glass-panel">
        
        {/* Header bar */}
        <div className="marketplace-header">
          <div className="header-meta">
            <span className="registry-eyebrow">AI Registry Hub</span>
            <h2>Model Marketplace</h2>
            <p>Download and deploy specialized neural networks for on-device background processing.</p>
          </div>
          <button className="close-circle-btn" onClick={onClose} type="button" aria-label="Close Marketplace">
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* Search controls */}
        <div className="marketplace-controls">
          <div className="search-input-wrap">
            <span className="material-icons-round search-icon">search</span>
            <input 
              type="text" 
              placeholder="Search registry models..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span className="material-icons-round">error_outline</span>
            <p>{error}</p>
          </div>
        )}

        {/* Models list / loading */}
        {loading ? (
          <div className="marketplace-loading-state">
            <div className="spinner-loader" />
            <p>Fetching remote model registry catalog...</p>
          </div>
        ) : (
          <div className="marketplace-scroll-area">
            {filteredModels.length === 0 ? (
              <div className="no-results-state">
                <span className="material-icons-round no-results-icon">search_off</span>
                <p>No models match "{searchTerm}"</p>
              </div>
            ) : (
              <div className="marketplace-cards-grid">
                {filteredModels.map(model => {
                  const isDownloading = downloading[model.id]
                  return (
                    <div key={model.id} className="registry-card">
                      <div className="card-top-section">
                        <div className="card-titles">
                          <h3>{model.name}</h3>
                          <span className={`card-type-chip type-${model.type}`}>
                            {model.type === 'builtin' ? 'Local built-in' : 'External network'}
                          </span>
                        </div>
                      </div>

                      <p className="card-description">{model.description}</p>

                      {/* Model parameters stats */}
                      <div className="card-metrics-grid">
                        <div className="metric-box">
                          <span className="metric-box-label">Inference speed</span>
                          <span className={`metric-box-val speed-${getSpeedBadge(model.speed)}`}>
                            {model.speed}
                          </span>
                        </div>
                        <div className="metric-box">
                          <span className="metric-box-label">Quality grade</span>
                          <span className={`metric-box-val accuracy-${getAccuracyBadge(model.accuracy)}`}>
                            {model.accuracy}
                          </span>
                        </div>
                        {model.size_mb && (
                          <div className="metric-box">
                            <span className="metric-box-label">Download size</span>
                            <span className="metric-box-val size-val">
                              {model.size_mb} MB
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        className={`download-action-btn ${isDownloading ? 'loading' : ''}`}
                        onClick={() => handleDownload(model.id)}
                        disabled={isDownloading}
                        type="button"
                      >
                        {isDownloading ? (
                          <>
                            <div className="btn-spinner" />
                            <span>Downloading weights...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-icons-round">download</span>
                            <span>{model.type === 'builtin' ? 'Initialize Engine' : 'Download Model'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
