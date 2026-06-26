import './Header.css'

export default function Header({ dark, onToggleDark }) {
  return (
    <header className="header">
      <div className="header-inner">
        {/* Brand */}
        <a className="brand" href="/" aria-label="LuminaBG home">
          <div className="brand-mark">
            <span className="material-icons-round">blur_on</span>
          </div>
          <span className="brand-name">LuminaBG</span>
        </a>

        {/* Right nav */}
        <nav className="header-nav" aria-label="Main navigation">
          <a
            className="nav-link"
            href="https://github.com/danielgatis/rembg"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="material-icons-round">code</span>
            GitHub
          </a>

          {/* Dark mode toggle */}
          <button
            className="btn-icon dark-toggle"
            onClick={onToggleDark}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="material-icons-round">
              {dark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </nav>
      </div>
    </header>
  )
}
