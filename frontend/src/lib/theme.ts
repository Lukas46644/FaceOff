import { createTheme, type PaletteMode } from '@mui/material'

// "Fog" design direction: soft, translucent, rounded — mirrors the blur/weichzeichnen effect.
export function createFogTheme(mode: PaletteMode) {
  const isDark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? '#9aa4e8' : '#6f7bd1' },
      background: {
        default: 'transparent',
        paper: isDark ? 'rgba(30,34,58,0.6)' : 'rgba(255,255,255,0.6)',
      },
      text: {
        primary: isDark ? '#e6e8fb' : '#2b2e4a',
        secondary: isDark ? '#aab0d9' : '#5c6088',
      },
    },
    shape: { borderRadius: 20 },
    typography: {
      fontFamily: "'Karla', -apple-system, 'Segoe UI', sans-serif",
      h1: { fontFamily: "'Quicksand', sans-serif", fontWeight: 600 },
      h2: { fontFamily: "'Quicksand', sans-serif", fontWeight: 600 },
      h3: { fontFamily: "'Quicksand', sans-serif", fontWeight: 600 },
      subtitle1: { fontFamily: "'Quicksand', sans-serif", fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backdropFilter: 'blur(20px)',
            backgroundImage: 'none',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.5)'}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 999, paddingInline: 20 },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: { borderRadius: 16 },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 16 },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 16 },
        },
      },
    },
  })
}
