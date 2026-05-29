import { useCallback, useState } from 'react'
import './UploadZone.css'

export default function UploadZone({ onFileSelect }) {
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback((file) => {
    if (!file) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      alert('Please upload a JPEG, PNG, WebP, or GIF image.')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      alert('File too large. Max 20MB.')
      return
    }
    onFileSelect(file)
  }, [onFileSelect])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragging(false)
  }, [])

  const handleInputChange = useCallback((e) => {
    const file = e.target.files?.[0]
    handleFile(file)
  }, [handleFile])

  return (
    <div
      className={`upload-zone ${dragging ? 'dragging' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => document.getElementById('file-input').click()}
    >
      <input
        id="file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />
      <div className="upload-icon">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <defs>
            <linearGradient id="upl" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7092ff" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="14" fill="url(#upl)" opacity="0.12" />
          <path d="M24 16v16M16 24l8-8 8 8" stroke="url(#upl)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 34h20" stroke="url(#upl)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        </svg>
      </div>
      <p className="upload-title">Drop your image here</p>
      <p className="upload-sub">or <span className="upload-link">browse files</span></p>
      <p className="upload-hint">PNG, JPG, WebP up to 20MB</p>
    </div>
  )
}
