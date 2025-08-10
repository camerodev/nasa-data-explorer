import { useEffect } from 'react'
import {
  Dialog, IconButton, Box, Stack, Typography, Tooltip
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

export default function Lightbox({ open, items, index, onClose, onIndex }) {
  const item = items[index] || {}

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'ArrowRight') onIndex?.((index + 1) % items.length)
      if (e.key === 'ArrowLeft') onIndex?.((index - 1 + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, index, items.length, onClose, onIndex])

  if (!open) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{ sx: { bgcolor: 'background.default', p: 0 } }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1.5 }}>
        <Stack>
          <Typography variant="subtitle1" noWrap>{item.title || 'Image'}</Typography>
          {item.subtitle && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {item.subtitle}
            </Typography>
          )}
        </Stack>
        <Stack direction="row" gap={1}>
          {item.href && (
            <Tooltip title="Open original">
              <IconButton component="a" href={item.href} target="_blank" rel="noreferrer">
                <OpenInNewIcon />
              </IconButton>
            </Tooltip>
          )}
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="center" sx={{ position: 'relative', p: 1, gap: 1 }}>
        <IconButton
          onClick={() => onIndex((index - 1 + items.length) % items.length)}
          size="large"
          sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}
        >
          <ChevronLeftIcon fontSize="inherit" />
        </IconButton>

        <Box sx={{ maxWidth: '95vw', maxHeight: '82vh' }}>
          <img
            src={item.src}
            alt={item.title || 'image'}
            style={{ maxWidth: '100%', maxHeight: '82vh', display: 'block', borderRadius: 12 }}
            loading="eager"
          />
        </Box>

        <IconButton
          onClick={() => onIndex((index + 1) % items.length)}
          size="large"
          sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
        >
          <ChevronRightIcon fontSize="inherit" />
        </IconButton>
      </Stack>
    </Dialog>
  )
}
