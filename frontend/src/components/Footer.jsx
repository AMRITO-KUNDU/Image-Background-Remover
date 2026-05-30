import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-text">
          Powered by{' '}
          <a href="https://github.com/danielgatis/rembg" target="_blank" rel="noopener noreferrer">rembg</a>
          {' '}— U2-Net, ISNet &amp; BiRefNet models
        </p>
        <p className="footer-note">
          <span className="material-icons-round">lock</span>
          Images are processed locally — nothing is stored
        </p>
      </div>
    </footer>
  )
}
