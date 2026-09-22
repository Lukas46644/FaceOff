import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Box } from '@mui/material'

interface CompareSliderProps {
  beforeSrc: string
  afterSrc: string
  beforeLabel?: string
  afterLabel?: string
}

function CompareSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Original',
  afterLabel = 'Result',
}: CompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(50)

  const updatePos = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.max(0, Math.min(100, pct)))
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    updatePos(event.clientX)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.buttons !== 1) return
    updatePos(event.clientX)
  }

  return (
    <Box
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      sx={{
        position: 'relative',
        width: '100%',
        touchAction: 'none',
        cursor: 'ew-resize',
        userSelect: 'none',
        borderRadius: 1,
        overflow: 'hidden',
        lineHeight: 0,
      }}
    >
      <Box
        component="img"
        src={beforeSrc}
        alt={beforeLabel}
        draggable={false}
        sx={{ display: 'block', width: '100%', height: 'auto' }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(0 0 0 ${pos}%)`,
        }}
      >
        <Box
          component="img"
          src={afterSrc}
          alt={afterLabel}
          draggable={false}
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          fontFamily: 'monospace',
          fontSize: 14,
          letterSpacing: '.05em',
          px: 1.6,
          py: 0.8,
          borderRadius: 99,
          bgcolor: 'rgba(255,255,255,.8)',
          color: '#2b2e4a',
        }}
      >
        {beforeLabel}
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          fontFamily: 'monospace',
          fontSize: 14,
          letterSpacing: '.05em',
          px: 1.6,
          py: 0.8,
          borderRadius: 99,
          bgcolor: 'rgba(255,255,255,.8)',
          color: '#2b2e4a',
        }}
      >
        {afterLabel}
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${pos}%`,
          width: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: -1,
            width: 2,
            bgcolor: '#fff',
            boxShadow: '0 0 0 1px rgba(43,46,74,.15)',
          },
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            bgcolor: '#fff',
            boxShadow: '0 8px 18px rgba(43,46,74,.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            color: 'primary.main',
          }}
        >
          ⇔
        </Box>
      </Box>
    </Box>
  )
}

export default CompareSlider
