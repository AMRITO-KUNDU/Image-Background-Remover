import './ModelSelector.css'

export default function ModelSelector({ models, selected, onSelect, onOpenMarketplace }) {
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
            title={isDisabled ? model.disabledReason : model.description}
            type="button"
          >
            {/* Selection indicator */}
            <span className={`radio-dot ${isSelected ? 'on' : ''}`} />

            {/* Icon */}
            <span className="model-icon material-icons-round">
              {model.icon || (model.id === 'remove.bg' ? 'cloud' : 'memory')}
            </span>

            {/* Text */}
            <span className="model-text">
              <span className="model-name">{model.name}</span>
              <span className="model-desc">
                {isDisabled ? model.disabledReason : model.description}
              </span>
            </span>

            {/* Badge */}
            <span className={`badge badge-${model.id === 'remove.bg' ? 'cloud' : 'local'}`}>
              {model.badge}
            </span>
          </button>
        )
      })}

      {/* Marketplace link row */}
      <button
        className="model-row marketplace-row"
        onClick={onOpenMarketplace}
        type="button"
      >
        <span className="material-icons-round marketplace-icon">storefront</span>
        <span className="model-text">
          <span className="model-name">More models…</span>
          <span className="model-desc">ISNet, BiRefNet, MODNet &amp; others</span>
        </span>
        <span className="material-icons-round chevron-icon">chevron_right</span>
      </button>
    </div>
  )
}
