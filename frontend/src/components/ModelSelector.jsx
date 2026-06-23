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

const BADGE_CLASS = {
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
    <div className="model-selector">
      {models.map((model) => (
        <button
          key={model.id}
          className={`model-option md-ripple ${selected === model.id ? 'selected' : ''}`}
          onClick={() => onSelect(model.id)}
          disabled={model.enabled === false}
          title={model.disabledReason || model.description}
        >
          <div className="model-option-inner">
            <div className="model-option-icon">
              <span className="material-icons-round">{ICONS[model.id] || 'psychology'}</span>
            </div>
            <div className="model-option-text">
              <span className="model-option-name">{model.name}</span>
              <span className="model-option-sub">{model.enabled === false ? model.disabledReason : model.description}</span>
            </div>
            <span className={`model-option-badge model-option-badge--${BADGE_CLASS[model.id] || 'default'}`}>
              {model.badge || model.speed}
            </span>
          </div>
        </button>
      ))}
      
      <button
        className="model-option marketplace-option md-ripple"
        onClick={onOpenMarketplace}
      >
        <div className="model-option-inner">
          <div className="model-option-icon">
            <span className="material-icons-round">store</span>
          </div>
          <div className="model-option-text">
            <span className="model-option-name">Marketplace</span>
            <span className="model-option-sub">Browse & download more models</span>
          </div>
          <span className="model-option-badge model-option-badge--marketplace">
            <span className="material-icons-round" style={{ fontSize: 14 }}>add</span>
          </span>
        </div>
      </button>
    </div>
  )
}
