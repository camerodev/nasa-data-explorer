import { Box, CircularProgress, Typography } from '@mui/material'

export function Loading({ label = 'Loading…', minHeight = 160 }) {
  return (
    <Box sx={{ minHeight, display: 'grid', placeItems: 'center', py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={22} />
        <Typography variant="body2" color="text.secondary">{label}</Typography>
      </Box>
    </Box>
  )
}
