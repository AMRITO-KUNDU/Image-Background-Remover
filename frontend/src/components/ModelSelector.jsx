import './ModelSelector.css'

const ICONS = {
  'remove.bg': 'cloud',
  'u2net': 'bolt',
  'isnet-general-use': 'tune',
  'birefnet-general': 'auto_awesome',
  'u2netp': 'flash_on',
  'silueta': 'person',
  'modnet': 'speed',
}

const STATS = {
  'remove.bg':        { speed: 95,  accuracy: 100 },
  'u2net':             { speed: 100, accuracy: 60 },
  'isnet-general-use': { speed: 80,  accuracy: 80 },
  'birefnet-general':  { speed: 55,  accuracy: 100 },
  'u2netp':            { speed: 100, accuracy: 50 },
  'silueta':           { speed: 90,  accuracy: 65 },
  'modnet':            { speed: 95,  accuracy: 60 },
}

const BADGES = {
  'remove.bg': 'api',
  'u2net': 'fast',
  'isnet-general-use': 'balanced',
  'birefnet-general': 'best',
  'u2netp': 'very-fast',
  'silueta': 'portrait',
  'modnet': 'realtime',
}

export default function ModelSelector({ models, selected, onSelect, onOpenMarketplace }) {
  return (
    <div className="model-selector-grid">
      {models.map((model) => {
        const isSelected = selected === model.id
        const stat = STATS[model.id] || { speed: 70, accuracy: 70 }
        const badge = BADGES[model.id] || 'default'

        return (
          <button
            key={model.id}
            className={`model-card-btn ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(model.id)}
            disabled={model.enabled === false}
            title={model.disabledReason || model.description}
            type="button"
          >
            <div className="model-card-top">
              <div className="model-card-icon">
                <span className="material-icons-round">{ICONS[model.id] || 'psychology'}</span>
              </div>
              <div className="model-card-text">
                <span className="model-card-name">{model.name}</span>
                <span className="model-card-desc">{model.description}</span>
              </div>
            </div>

            {/* Inline Mini-Stats bars */}
            {model.enabled !== false && (
              <div className="model-card-metrics">
                <div className="metric-mini-bar">
                  <span className="metric-label">Spd</span>
                  <div className="metric-bar-track">
                    <div className="metric-bar-fill fill-speed" style={{ width: `${stat.speed}%` }} />
                  </div>
                </div>
                <div className="metric-mini-bar">
                  <span className="metric-label">Acc</span>
                  <div className="metric-bar-track">
                    <div className="metric-bar-fill fill-acc" style={{ width: `${stat.accuracy}%` }} />
                  </div>
                </div>
              </div>
            )}

            {model.enabled === false && (
              <div className="model-disabled-label">
                <span className="material-icons-round">lock</span>
                <span>{model.disabledReason || 'Unavailable'}</span>
              </div>
            )}

            <span className={`model-card-badge badge-${badge}`}>
              {model.badge || model.speed}
            </span>
          </button>
        )
      })}
      
      {/* Marketplace Entry Card */}
      <button
        className="model-card-btn marketplace-card-btn"
        onClick={onOpenMarketplace}
        type="button"
      >
        <div className="model-card-top">
          <div className="model-card-icon marketplace-icon">
            <span className="material-icons-round">storefront</span>
          </div>
          <div className="model-card-text">
            <span className="model-card-name">Registry Marketplace</span>
            <span className="model-card-desc">Browse and download local AI models</span>
          </div>
        </div>
        <div className="marketplace-btn-hint">
          <span>Open Marketplace</span>
          <span className="material-icons-round">arrow_forward</span>
        </div>
      </button>
    </div>
  )
}
