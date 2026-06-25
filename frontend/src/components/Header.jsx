import { useState, useRef, useEffect } from 'react'
import './Header.css'

export default function Header({ theme, setTheme, borderRadius, setBorderRadius }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const THEMES = [
    { id: 'dark-lumina', name: 'Lumina Dark', desc: 'Obsidian & Neon Cyan', dot: '#06b6d4' },
    { id: 'dark-aurora', name: 'Aurora Glow', desc: 'Forest & Neon Emerald', dot: '#10b981' },
    { id: 'dark-sunset', name: 'Sunset Flare', desc: 'Charcoal & Coral Rose', dot: '#f43f5e' },
    { id: 'minimal-dark', name: 'Vercel Obsidian', desc: 'High-Contrast Monochrome', dot: '#ffffff' },
  ]

  const RADII = [
    { id: 'rounded-none', name: 'Sharp', desc: '0px' },
    { id: 'rounded-medium', name: 'Medium', desc: '8px' },
    { id: 'rounded-large', name: 'SaaS Glass', desc: '14px' },
    { id: 'rounded-full', name: 'Pill', desc: '20px' },
  ]

  return (
    <header className="header glass-panel">
      <div className="header-inner">
        <div className="logo-mark">
          <div className="logo-icon-wrap animate-logo">
            <span className="material-icons-round">blur_on</span>
          </div>
          <span className="logo-text">Lumina<strong className="logo-highlight">BG</strong></span>
        </div>

        <nav className="nav">
          <a className="nav-link" href="https://github.com/danielgatis/rembg" target="_blank" rel="noopener noreferrer">
            <span className="material-icons-round">help_outline</span>
            <span>Docs</span>
          </a>
          <a className="nav-link" href="https://github.com/danielgatis/rembg" target="_blank" rel="noopener noreferrer">
            <span className="material-icons-round">code</span>
            <span>GitHub</span>
          </a>

          <div className="vertical-divider" />

          {/* Dynamic Theme Customizer Dropdown */}
          <div className="theme-customizer-container" ref={dropdownRef}>
            <button 
              className={`customizer-trigger ${dropdownOpen ? 'active' : ''}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              title="Customize Brand Aesthetics"
              type="button"
            >
              <span className="material-icons-round">palette</span>
              <span>Theme</span>
              <span className="material-icons-round chevron">expand_more</span>
            </button>

            {dropdownOpen && (
              <div className="customizer-dropdown glass-panel">
                <div className="dropdown-section">
                  <h3 className="dropdown-section-title">Brand Aesthetics</h3>
                  <div className="themes-list">
                    {THEMES.map((t) => (
                      <button
                        key={t.id}
                        className={`dropdown-item theme-item ${theme === t.id ? 'selected' : ''}`}
                        onClick={() => setTheme(t.id)}
                        type="button"
                      >
                        <span className="theme-dot" style={{ backgroundColor: t.dot }} />
                        <div className="item-text">
                          <span className="item-name">{t.name}</span>
                          <span className="item-desc">{t.desc}</span>
                        </div>
                        {theme === t.id && (
                          <span className="material-icons-round check-icon">check</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="dropdown-divider" />

                <div className="dropdown-section">
                  <h3 className="dropdown-section-title">Corner Style</h3>
                  <div className="radii-grid">
                    {RADII.map((r) => (
                      <button
                        key={r.id}
                        className={`radii-item ${borderRadius === r.id ? 'selected' : ''}`}
                        onClick={() => setBorderRadius(r.id)}
                        type="button"
                      >
                        <span className="radii-name">{r.name}</span>
                        <span className="radii-desc">{r.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}
