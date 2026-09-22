import { useState } from 'react'
import DownloadIcon from '@mui/icons-material/Download'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import AnonymizeSettings from './AnonymizeSettings'
import CompareSlider from './CompareSlider'
import { API_URL } from '../lib/api'

function ImageUpload() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [resultUrl, setResultUrl] = useState(null)
  const [resultFilename, setResultFilename] = useState(null)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState(null)

  const [method, setMethod] = useState('pixelate')
  const [intensity, setIntensity] = useState(50)
  const [shape, setShape] = useState('square')

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0]
    if (!selected) return

    setFile(selected)
    setPreview(URL.createObjectURL(selected))
    setResultUrl(null)
    setResultFilename(null)
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
          Select image
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
          {status === 'uploading' ? <CircularProgress size={20} color="inherit" /> : 'Process'}
        </Button>

        {resultUrl && (
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload}>
            Download image
          </Button>
        )}

        {status === 'error' && <Alert severity="error">{errorMessage}</Alert>}
      </Stack>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        {!preview && (
          <Typography color="text.secondary">No image selected yet.</Typography>
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
              Original / Result (Drag slider to compare)
            </Typography>
            <CompareSlider beforeSrc={preview} afterSrc={resultUrl} beforeLabel="Original" afterLabel="Result" />
          </Box>
        )}
      </Box>
    </Stack>
  )
}

export default ImageUpload
