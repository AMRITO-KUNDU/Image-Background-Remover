import './ModelSelector.css'

function badgeClass(badge, id) {
  if (badge === 'Cloud' || id === 'remove.bg') return 'cloud'
  if (badge === 'Heavy' || id === 'birefnet-general') return 'heavy'
  return 'local'
}

export default function ModelSelector({ models, selected, onSelect }) {
  return (
    <div className="model-list">
      {models.map((model) => {
        const isSelected = selected === model.id
        const isDisabled = model.enabled === false

        return (
          <button
            key={model.id}
            className={`model-row ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
            onClick={() => !isDisabled && onSelect(model.id)}
            disabled={isDisabled}
            title={isDisabled ? (model.disabledReason || model.description) : model.description}
            type="button"
          >
            <span className={`radio-dot ${isSelected ? 'on' : ''}`} />
            <span className="model-icon material-icons-round">
              {model.icon || (model.id === 'remove.bg' ? 'cloud' : model.id === 'browser' ? 'devices' : 'memory')}
            </span>
            <span className="model-text">
              <span className="model-name">{model.name}</span>
              <span className="model-desc">
                {isDisabled ? (model.disabledReason || model.description) : model.description}
              </span>
            </span>
            <span className={`badge badge-${badgeClass(model.badge, model.id)}`}>
              {model.badge}
            </span>
          </button>
        )
      })}
    </div>
  )
}
