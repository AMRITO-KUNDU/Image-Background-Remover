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
      alert('File too large. Maximum size is 20MB.')
      return
    }
    onFileSelect(file)
  }, [onFileSelect])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }, [handleFile])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setDragging(false), [])

  const handleInputChange = useCallback((e) => {
    handleFile(e.target.files?.[0])
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

      <div className="upload-icon-container">
        <span className="material-icons-round">cloud_upload</span>
      </div>

      <p className="upload-title">Drop your image here</p>

      <div className="upload-divider">or</div>

      <button className="md-btn-tonal" onClick={(e) => { e.stopPropagation(); document.getElementById('file-input').click() }}>
        <span className="material-icons-round">folder_open</span>
        Browse files
      </button>

      <p className="upload-hint">PNG, JPG, WebP · Up to 20 MB</p>
    </div>
  )
}
