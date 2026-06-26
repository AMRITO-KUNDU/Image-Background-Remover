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
      alert('File too large. Maximum size is 20 MB.')
      return
    }
    onFileSelect(file)
  }, [onFileSelect])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }, [handleFile])

  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragging(true) }, [])
  const handleDragLeave = useCallback(() => setDragging(false), [])
  const handleChange = useCallback((e) => handleFile(e.target.files?.[0]), [handleFile])
  const open = () => document.getElementById('file-input').click()

  return (
    <div
      className={`upload-zone ${dragging ? 'drag-over' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={open}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && open()}
      aria-label="Upload image"
    >
      <input
        id="file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleChange}
      />

      <div className="upload-inner">
        <div className="upload-icon-wrap">
          <span className="material-icons-round upload-icon">upload_file</span>
        </div>
        <p className="upload-title">Drop image here or <span className="upload-browse">click to browse</span></p>
        <p className="upload-hint">PNG, JPG, WebP, GIF · up to 20 MB</p>
      </div>
    </div>
  )
}
