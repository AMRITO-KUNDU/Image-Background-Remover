import './ModelSelector.css'

export default function ModelSelector({ models, selected, onSelect }) {
  return (
    <div className="model-selector">
      {models.map((model) => (
        <button
          key={model.id}
          className={`model-option ${selected === model.id ? 'selected' : ''}`}
          onClick={() => onSelect(model.id)}
        >
          <div className="model-option-top">
            <span className="model-option-name">{model.name}</span>
            <span
              className="model-option-badge"
              style={selected === model.id ? { color: model.badgeColor, borderColor: model.badgeColor } : {}}
            >
              {model.badge}
            </span>
          </div>
          <p className="model-option-desc">{model.description}</p>
        </button>
      ))}
    </div>
  )
}
