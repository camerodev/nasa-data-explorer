import { useEffect, useMemo, useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  Box, Stack, TextField, MenuItem, Typography,
  Button, Card, CardMedia, CardContent, Skeleton, Alert
} from '@mui/material'

import Lightbox from '../components/Lightbox'
import { getMarsPhotos } from '../api/nasa'
import { qk } from '../api/keys'

const ROVERS = ['curiosity', 'opportunity', 'spirit', 'perseverance']
const CAMERAS = ['FHAZ','RHAZ','MAST','NAVCAM','PANCAM','MINITES','CHEMCAM']

export default function Mars() {
  const [sp, setSp] = useSearchParams()

  const [rover, setRover] = useState(sp.get('rover') || 'curiosity')
  const [earthDate, setEarthDate] = useState(sp.get('date') || '2015-06-03')
  const [camera, setCamera] = useState(sp.get('camera') ?? '')

  useEffect(() => {
    const next = new URLSearchParams()
    if (rover) next.set('rover', rover)
    if (earthDate) next.set('date', earthDate)
    next.set('camera', camera)
    setSp(next, { replace: true })
  }, [rover, earthDate, camera, setSp])

  const key = useMemo(() => qk.mars(rover, earthDate, camera, 'infinite'), [rover, earthDate, camera])

  const q = useInfiniteQuery({
    queryKey: key,
    queryFn: async ({ pageParam = 1 }) => {
      const items = await getMarsPhotos({
        rover,
        earth_date: earthDate,
        page: pageParam,
        ...(camera ? { camera } : {})
      })
      return { items, nextPage: items.length ? pageParam + 1 : undefined }
    },
    getNextPageParam: last => last.nextPage,
    keepPreviousData: true
  })

  const photos = q.data?.pages.flatMap(p => p.items) ?? []
  const isFirstLoad = q.isLoading && !q.data
  const noResults = !isFirstLoad && !q.isError && photos.length === 0

  const [lbOpen, setLbOpen] = useState(false)
  const [lbIndex, setLbIndex] = useState(0)
  const lbItems = useMemo(() => photos.map(p => ({
    src: p.img_src,
    title: `${p.rover?.name ?? ''} • ${p.camera?.full_name ?? p.camera?.name ?? ''}`,
    subtitle: p.earth_date,
    href: p.img_src
  })), [photos])

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} gap={2} alignItems="center">
        <TextField
          select
          label="Rover"
          value={rover}
          onChange={e => setRover(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          {ROVERS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
        </TextField>

        <TextField
          type="date"
          label="Earth date"
          value={earthDate}
          onChange={e => setEarthDate(e.target.value)}
        />

        <TextField
          select
          label="Camera"
          value={camera}
          onChange={e => setCamera(e.target.value)}
          sx={{
            minWidth: 220,
            '& .MuiSelect-select': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }
          }}
          SelectProps={{
            displayEmpty: true,
            renderValue: (val) => (val ? val : 'Any camera')
          }}
          InputLabelProps={{ shrink: true }}
        >
          <MenuItem value="">
            <em>Any camera</em>
          </MenuItem>
          {CAMERAS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </TextField>
      </Stack>

      {isFirstLoad && (
        <Box sx={{
          mt: 3, display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 2
        }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <Skeleton variant="rectangular" height={200} />
              <CardContent>
                <Skeleton width="70%" />
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {q.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {q.error?.message || 'Failed to load Mars photos.'}
        </Alert>
      )}

      {noResults && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No photos for these filters. Try another date/camera/rover.
        </Alert>
      )}

      {!!photos.length && (
        <Box sx={{
          mt: 3, display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 2
        }}>
          {photos.map((p, i) => (
            <Card key={p.id} sx={{ overflow: 'hidden', bgcolor: 'background.paper' }}>
              <CardMedia
                component="img"
                image={p.img_src}
                alt={`${p.rover?.name ?? 'Rover'} — ${p.camera?.full_name ?? p.camera?.name ?? 'Camera'}`}
                loading="lazy"
                sx={{ aspectRatio: '4 / 3', objectFit: 'cover', cursor: 'zoom-in' }}
                onClick={() => { setLbIndex(i); setLbOpen(true) }}
                onLoad={(e) => e.currentTarget.classList.add('loaded')}
              />
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {p.rover?.name} • {p.camera?.full_name ?? p.camera?.name} • {p.earth_date}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {!!photos.length && q.hasNextPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="outlined"
            disabled={q.isFetchingNextPage}
            onClick={() => q.fetchNextPage()}
          >
            {q.isFetchingNextPage ? 'Loading more…' : 'Load more'}
          </Button>
        </Box>
      )}

      <Lightbox
        open={lbOpen}
        items={lbItems}
        index={lbIndex}
        onClose={() => setLbOpen(false)}
        onIndex={setLbIndex}
      />
    </Box>
  )
}

