import { useState, type ChangeEvent } from 'react'
import DownloadIcon from '@mui/icons-material/Download'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import AnonymizeSettings, { type Method, type Shape } from './AnonymizeSettings'
import CompareSlider from './CompareSlider'
import { API_URL } from '../lib/api'

type Status = 'idle' | 'uploading' | 'success' | 'error'

function ImageUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultFilename, setResultFilename] = useState<string | null>(null)
  const [faceCount, setFaceCount] = useState<number | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [method, setMethod] = useState<Method>('pixelate')
  const [intensity, setIntensity] = useState(50)
  const [shape, setShape] = useState<Shape>('square')

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    if (!selected) return

    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setResultUrl(null)
    setResultFilename(null)
    setFaceCount(null)
    setStatus('idle')
    setErrorMessage(null)
  }

  const handleSubmit = async () => {
    if (!file) return

    setStatus('uploading')
    setErrorMessage(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('method', method)
    formData.append('intensity', String(intensity))
    formData.append('shape', shape)

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
      setResultFilename(data.filename)
      setFaceCount(data.faces_detected)
      setStatus('success')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed')
      setStatus('error')
    }
  }

  const handleDownload = async () => {
    if (!resultUrl || !resultFilename) return

    const response = await fetch(resultUrl)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = blobUrl
    link.download = resultFilename
    link.click()

    URL.revokeObjectURL(blobUrl)
  }

  return (
    <Stack direction="row" spacing={4} sx={{ width: '100%', alignItems: 'flex-start' }}>
      <Stack spacing={3} sx={{ width: 320, flexShrink: 0 }}>
        <Button variant="outlined" component="label">
          Bild auswählen
          <input type="file" accept="image/*" hidden onChange={handleFileChange} />
        </Button>

        <AnonymizeSettings
          method={method}
          intensity={intensity}
          shape={shape}
          onMethodChange={setMethod}
          onIntensityChange={setIntensity}
          onShapeChange={setShape}
        />

        <Button
          variant="contained"
          disabled={!file || status === 'uploading'}
          onClick={handleSubmit}
        >
          {status === 'uploading' ? <CircularProgress size={20} color="inherit" /> : 'Verarbeiten'}
        </Button>

        {resultUrl && (
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload}>
            Bild herunterladen
          </Button>
        )}

        {status === 'success' && (
          <Alert severity="success">{faceCount} Gesicht(er) erkannt und anonymisiert.</Alert>
        )}
        {status === 'error' && <Alert severity="error">{errorMessage}</Alert>}
      </Stack>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        {!preview && (
          <Typography color="text.secondary">Noch kein Bild ausgewählt.</Typography>
        )}

        {preview && !resultUrl && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Original
            </Typography>
            <Box component="img" src={preview} alt="Original" sx={{ width: '100%', display: 'block' }} />
          </Box>
        )}

        {preview && resultUrl && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Original / Ergebnis (Regler ziehen zum Vergleichen)
            </Typography>
            <CompareSlider beforeSrc={preview} afterSrc={resultUrl} beforeLabel="Original" afterLabel="Ergebnis" />
          </Box>
        )}
      </Box>
    </Stack>
  )
}

export default ImageUpload
