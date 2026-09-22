import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material'
import { createFogTheme } from './lib/theme'
import './index.css'
import App from './App.jsx'

function Root() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = createFogTheme(prefersDark ? 'dark' : 'light')

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
