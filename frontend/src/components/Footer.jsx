import './Footer.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer glass-panel">
      <div className="footer-inner">
        <div className="footer-left">
          <p className="footer-brand">Lumina<strong>BG</strong></p>
          <p className="footer-copyright">
            &copy; {currentYear} LuminaBG. All rights reserved.
          </p>
        </div>

        <div className="footer-center">
          <p className="footer-privacy-badge">
            <span className="material-icons-round">security</span>
            <span>100% Client-Side Processing. No data is stored on remote servers.</span>
          </p>
        </div>

        <div className="footer-right">
          <p className="footer-credits">
            Powered by{' '}
            <a href="https://github.com/danielgatis/rembg" target="_blank" rel="noopener noreferrer" className="footer-link">
              rembg neural net
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
