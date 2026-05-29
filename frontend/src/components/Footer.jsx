import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-text">
          Powered by <strong>U2-Net</strong>, <strong>ISNet</strong>, and <strong>BiRefNet</strong> via{' '}
          <a href="https://github.com/danielgatis/rembg" target="_blank" rel="noopener noreferrer">rembg</a>
        </p>
        <p className="footer-note">Images processed locally. Nothing is stored on servers.</p>
      </div>
    </footer>
  )
}
