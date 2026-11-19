import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-copy">
          © {new Date().getFullYear()} LuminaBG · Powered by{' '}
          <a
            href="https://github.com/danielgatis/rembg"
            target="_blank"
            rel="noopener noreferrer"
          >
            rembg
          </a>
        </p>

        <nav className="footer-links" aria-label="Help and privacy">
          <a href="/how-to-remove-image-background.html">How to remove a background</a>
          <a href="/privacy.html">Image processing &amp; privacy</a>
        </nav>

        <p className="footer-privacy">
          <span className="material-icons-round">lock</span>
          <a href="/privacy.html">Choose on-device or cloud processing</a>
        </p>
      </div>
    </footer>
  )
}
