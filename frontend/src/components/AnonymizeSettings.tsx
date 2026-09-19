import {
  Box,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Stack,
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

const METHOD_OPTIONS: { value: Method; label: string; hint: string }[] = [
  {
    value: 'pixelate',
    label: 'Verpixeln',
    hint: 'Kann sensible Inhalte nicht immer vollständig schützen',
  },
  {
    value: 'blur',
    label: 'Verwischen',
    hint: 'Kann sensible Inhalte nicht immer vollständig schützen',
  },
  {
    value: 'darken',
    label: 'Verdunkeln',
    hint: 'Hoher Datenschutz',
  },
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
      <RadioGroup
        row
        value={method}
        onChange={(event) => onMethodChange(event.target.value as Method)}
        sx={{ flexWrap: 'nowrap', justifyContent: 'space-between' }}
      >
        {METHOD_OPTIONS.map((option) => (
          <Stack key={option.value} spacing={0.5} sx={{ alignItems: 'center', flex: 1 }}>
            <Typography variant="subtitle1">{option.label}</Typography>
            <FormControlLabel value={option.value} control={<Radio />} label="" sx={{ m: 0 }} />
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              {option.hint}
            </Typography>
          </Stack>
        ))}
      </RadioGroup>

      <Box sx={{ mt: 4, px: 1 }}>
        <Typography gutterBottom>Intensität</Typography>
        <Slider
          value={intensity}
          onChange={(_, value) => onIntensityChange(value as number)}
          min={0}
          max={100}
        />
      </Box>

      <FormControl fullWidth sx={{ mt: 2 }}>
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
