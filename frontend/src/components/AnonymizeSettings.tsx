import BlurOnIcon from '@mui/icons-material/BlurOn'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import GridOnIcon from '@mui/icons-material/GridOn'
import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  type SelectChangeEvent,
} from '@mui/material'

export type Method = 'pixelate' | 'blur' | 'darken'
export type Shape = 'circle' | 'square'

interface AnonymizeSettingsProps {
  method: Method
  intensity: number
  shape: Shape
  onMethodChange: (method: Method) => void
  onIntensityChange: (intensity: number) => void
  onShapeChange: (shape: Shape) => void
}

const METHOD_OPTIONS: { value: Method; label: string; icon: React.ReactNode }[] = [
  { value: 'pixelate', label: 'Verpixeln', icon: <GridOnIcon fontSize="small" /> },
  { value: 'blur', label: 'Verwischen', icon: <BlurOnIcon fontSize="small" /> },
  { value: 'darken', label: 'Verdunkeln', icon: <DarkModeIcon fontSize="small" /> },
]

function AnonymizeSettings({
  method,
  intensity,
  shape,
  onMethodChange,
  onIntensityChange,
  onShapeChange,
}: AnonymizeSettingsProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3, width: '100%', maxWidth: 560 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
        Methode
      </Typography>
      <ToggleButtonGroup
        value={method}
        exclusive
        fullWidth
        onChange={(_, value) => value && onMethodChange(value)}
        sx={{ mb: 3 }}
      >
        {METHOD_OPTIONS.map((option) => (
          <ToggleButton
            key={option.value}
            value={option.value}
            sx={{ flexDirection: 'column', gap: 0.5, py: 1.2, textTransform: 'none' }}
          >
            {option.icon}
            <Typography variant="caption">{option.label}</Typography>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Intensität
      </Typography>
      <Slider
        value={intensity}
        onChange={(_, value) => onIntensityChange(value as number)}
        min={0}
        max={100}
        sx={{ mb: 3 }}
      />

      <FormControl fullWidth>
        <InputLabel id="anonymize-shape-label">Form</InputLabel>
        <Select
          labelId="anonymize-shape-label"
          label="Form"
          value={shape}
          onChange={(event: SelectChangeEvent) => onShapeChange(event.target.value as Shape)}
        >
          <MenuItem value="circle">Kreis</MenuItem>
          <MenuItem value="square">Viereck</MenuItem>
        </Select>
      </FormControl>
    </Paper>
  )
}

export default AnonymizeSettings
