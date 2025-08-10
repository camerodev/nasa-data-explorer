import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box, Container, Stack, TextField, Button, Card, CardContent, CardMedia,
  Typography, Alert, Skeleton, Tooltip, IconButton
} from '@mui/material'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

import { getApod } from '../api/nasa'
import { qk } from '../api/keys'

const toYmd = (d) => d.toISOString().slice(0, 10)
const todayUTC = () => {
  const d = new Date()
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}
const APOD_START = new Date('1995-06-16T00:00:00Z')
function randomDateBetween(start, end) {
  const t = start.getTime() + Math.random() * (end.getTime() - start.getTime())
  return toYmd(new Date(t))
}

export default function Apod() {
  const maxDate = useMemo(todayUTC, [])
  const [date, setDate] = useState(toYmd(maxDate))

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: qk.apod(date),
    queryFn: () => getApod({ date, thumbs: true }),
    retry: (count, err) => (err?.response?.status !== 404 && count < 2)
  })

  const [imgSrc, setImgSrc] = useState(null)
  useEffect(() => {
    if (!data || data.media_type === 'video') {
      setImgSrc(null)
      return
    }
    const base = data.url || data.thumbnail_url || null
    const hd = data.hdurl || null
    setImgSrc(base || hd)

    if (hd && hd !== base) {
      const im = new Image()
      im.src = hd
      im.decoding = 'async'
      im.onload = () => setImgSrc(hd)
    }
  }, [data])

  const onPickDate = (val) => {
    const picked = new Date(val + 'T00:00:00Z')
    setDate(picked > maxDate ? toYmd(maxDate) : val)
  }
  const onSurprise = () => {
    const end = new Date(maxDate)
    end.setUTCDate(end.getUTCDate() - 1)
    setDate(randomDateBetween(APOD_START, end))
  }
  const onTryYesterday = () => {
    const y = new Date(maxDate)
    y.setUTCDate(y.getUTCDate() - 1)
    setDate(toYmd(y))
  }

  return (
    <Container sx={{ py: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems="center">
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={(e) => onPickDate(e.target.value)}
          inputProps={{ min: toYmd(APOD_START), max: toYmd(maxDate) }}
          sx={{ width: { xs: '100%', sm: 240 } }}
        />
        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
          <Button variant="contained" onClick={onSurprise}>Surprise me</Button>
          <Button variant="outlined" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
        </Stack>
      </Stack>

      {(isLoading || isFetching) && !data && (
        <Card sx={{ mt: 2, overflow: 'hidden' }}>
          <Skeleton variant="rectangular" height={380} />
          <CardContent>
            <Skeleton width="60%" />
            <Skeleton width="90%" />
            <Skeleton width="80%" />
          </CardContent>
        </Card>
      )}

      {isError && !data && (
        <Alert
          severity="warning"
          sx={{ mt: 2 }}
          action={
            error?.response?.status === 404 ? (
              <Button color="inherit" size="small" onClick={onTryYesterday}>
                Try yesterday
              </Button>
            ) : (
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Retry
              </Button>
            )
          }
        >
          {error?.response?.status === 404
            ? 'No APOD available for this date yet. NASA may not have published it.'
            : (error?.message || 'Failed to load APOD.')}
        </Alert>
      )}

      {data && (
        <Card sx={{ mt: 2, overflow: 'hidden' }}>
          {data.media_type === 'video' ? (
            <Box sx={{ position: 'relative', pt: '56.25%' }}>
              <Box
                component="iframe"
                title={data.title}
                src={data.url}
                allowFullScreen
                sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              />
            </Box>
          ) : (
            <CardMedia
              component="img"
              image={imgSrc || ''}
              alt={data.title}
              loading="eager"
              decoding="async"
              sx={{ maxHeight: 700, objectFit: 'contain', bgcolor: 'black' }}
            />
          )}

          <CardContent>
            <Stack direction="row" alignItems="center" gap={1} justifyContent="space-between" flexWrap="wrap">
              <Typography variant="h6" sx={{ mr: 1 }}>{data.title}</Typography>

              {(data.hdurl || data.url) && (
                <Tooltip title={data.hdurl ? 'Open HD image' : 'Open source image'}>
                  <IconButton
                    size="small"
                    color="primary"
                    href={data.hdurl || data.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>

            {data.date && (
              <Typography variant="caption" color="text.secondary">
                {data.date}
              </Typography>
            )}

            {data.explanation && (
              <Typography variant="body2" sx={{ mt: 1.5, whiteSpace: 'pre-wrap' }}>
                {data.explanation}
              </Typography>
            )}

            {data.copyright && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                © {data.copyright}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  )
}
