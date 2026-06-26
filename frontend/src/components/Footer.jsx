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

        <p className="footer-privacy">
          <span className="material-icons-round">lock</span>
          Images are processed privately — nothing is stored
        </p>
      </div>
    </footer>
  )
}
