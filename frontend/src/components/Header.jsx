import './Header.css'

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo-mark">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <defs>
              <linearGradient id="lg1" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7092ff" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <rect width="28" height="28" rx="8" fill="url(#lg1)" opacity="0.15" />
            <path d="M14 6C9.58 6 6 9.58 6 14s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="url(#lg1)" />
            <path d="M14 10a4 4 0 100 8 4 4 0 000-8z" fill="url(#lg1)" opacity="0.6" />
          </svg>
          <span className="logo-text">BG<span className="logo-accent">Remover</span></span>
        </div>

        <nav className="nav">
          <a className="nav-link" href="#" title="How it works">How it works</a>
          <a className="nav-link" href="#" title="API">API</a>
          <a className="nav-link" href="https://github.com/Bria-AI/RMBG-2.0" target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </div>
    </header>
  )
}
