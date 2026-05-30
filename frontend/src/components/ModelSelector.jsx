import './ModelSelector.css'

const ICONS = {
  'u2net': 'bolt',
  'isnet-general-use': 'tune',
  'birefnet-general': 'auto_awesome',
}

const BADGE_CLASS = {
  'u2net': 'fast',
  'isnet-general-use': 'balanced',
  'birefnet-general': 'best',
}

export default function ModelSelector({ models, selected, onSelect }) {
  return (
    <div className="model-selector">
      {models.map((model) => (
        <button
          key={model.id}
          className={`model-option md-ripple ${selected === model.id ? 'selected' : ''}`}
          onClick={() => onSelect(model.id)}
        >
          <div className="model-option-inner">
            <div className="model-option-icon">
              <span className="material-icons-round">{ICONS[model.id]}</span>
            </div>
            <div className="model-option-text">
              <span className="model-option-name">{model.name}</span>
              <span className="model-option-sub">{model.description}</span>
            </div>
            <span className={`model-option-badge model-option-badge--${BADGE_CLASS[model.id]}`}>
              {model.badge}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
