import { useState, useEffect } from 'react'
import './Marketplace.css'

export default function Marketplace({ onClose, onModelDownloaded }) {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState({})
  const [error, setError] = useState(null)

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
      setError('Failed to load marketplace models')
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
        throw new Error(data.detail || 'Download failed')
      }

      // Refresh the main models list
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

  return (
    <div className="marketplace-overlay">
      <div className="marketplace-modal">
        <div className="marketplace-header">
          <div>
            <h2>Model Marketplace</h2>
            <p>Browse and download additional AI models</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {error && (
          <div className="marketplace-error">
            <span className="material-icons-round">error_outline</span>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="marketplace-loading">
            <div className="md-circular-progress" />
            <p>Loading marketplace...</p>
          </div>
        ) : (
          <div className="marketplace-grid">
            {models.map(model => (
              <div key={model.id} className="marketplace-card">
                <div className="marketplace-card-header">
                  <h3>{model.name}</h3>
                  <span className={`model-type-badge ${model.type}`}>
                    {model.type === 'builtin' ? 'Built-in' : 'External'}
                  </span>
                </div>

                <p className="marketplace-card-description">{model.description}</p>

                <div className="marketplace-card-stats">
                  <div className="stat">
                    <span className="stat-label">Speed</span>
                    <span className={`stat-badge speed ${getSpeedBadge(model.speed)}`}>
                      {model.speed}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Accuracy</span>
                    <span className={`stat-badge accuracy ${getAccuracyBadge(model.accuracy)}`}>
                      {model.accuracy}
                    </span>
                  </div>
                  {model.size_mb && (
                    <div className="stat">
                      <span className="stat-label">Size</span>
                      <span className="stat-value">{model.size_mb} MB</span>
                    </div>
                  )}
                </div>

                <button
                  className="download-btn"
                  onClick={() => handleDownload(model.id)}
                  disabled={downloading[model.id]}
                >
                  {downloading[model.id] ? (
                    <>
                      <div className="btn-spinner" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <span className="material-icons-round">download</span>
                      {model.type === 'builtin' ? 'Load Model' : 'Download'}
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
