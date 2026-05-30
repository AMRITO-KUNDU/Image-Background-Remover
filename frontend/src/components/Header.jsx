import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo-mark">
          <div className="logo-icon-wrap">
            <span className="material-icons-round">auto_fix_high</span>
          </div>
          <span className="logo-text">BG Remover</span>
        </div>

        <nav className="nav">
          <a className="nav-btn" href="https://m3.material.io" target="_blank" rel="noopener noreferrer">
            <span className="material-icons-round">help_outline</span>
            How it works
          </a>
          <a className="nav-btn" href="https://github.com/danielgatis/rembg" target="_blank" rel="noopener noreferrer">
            <span className="material-icons-round">code</span>
            GitHub
          </a>
        </nav>
      </div>
    </header>
  )
}
