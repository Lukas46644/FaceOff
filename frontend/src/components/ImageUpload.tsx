import { useState, type ChangeEvent } from 'react'
import { API_URL } from '../lib/api'

type Status = 'idle' | 'uploading' | 'success' | 'error'

function ImageUpload() {
  const [preview, setPreview] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [faceCount, setFaceCount] = useState<number | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setResultUrl(null)
    setFaceCount(null)
    setStatus('uploading')
    setErrorMessage(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.detail ?? 'Upload failed')
      }

      const data = await response.json()
      setResultUrl(`${API_URL}/uploads/${data.filename}`)
      setFaceCount(data.faces_detected)
      setStatus('success')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed')
      setStatus('error')
    }
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
        {preview && (
          <div>
            <p>Original</p>
            <img src={preview} alt="Original" style={{ maxWidth: 300, display: 'block' }} />
          </div>
        )}
        {resultUrl && (
          <div>
            <p>Verpixelt</p>
            <img src={resultUrl} alt="Verpixelt" style={{ maxWidth: 300, display: 'block' }} />
          </div>
        )}
      </div>

      {status === 'uploading' && <p>Wird verarbeitet…</p>}
      {status === 'success' && <p>{faceCount} Gesicht(er) erkannt und verpixelt.</p>}
      {status === 'error' && <p>Fehler: {errorMessage}</p>}
    </div>
  )
}

export default ImageUpload
