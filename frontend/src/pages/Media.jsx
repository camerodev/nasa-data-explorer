import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  Box, TextField, Typography, Pagination, MenuItem,
  Card, CardMedia, CardContent, Skeleton, Alert, Stack
} from '@mui/material'

import Lightbox from '../components/Lightbox'
import { qk } from '../api/keys'
import { searchMedia } from '../api/nasa'

function pickItemThumb(item) {
  const href = item?.links?.find(l => l.rel !== 'captions')?.href
  return href || ''
}

function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100]

export default function Media() {
  const [sp, setSp] = useSearchParams()

  const [q, setQ] = useState(sp.get('q') || 'orion')
  const [page, setPage] = useState(() => {
    const n = Number(sp.get('page'))
    return Number.isFinite(n) && n > 0 ? n : 1
  })

  const initialPageSize = (() => {
    const raw = sp.get('pageSize')
    const n = Number(raw)
    return PAGE_SIZE_OPTIONS.includes(n) ? n : 50
  })()
  const [pageSize, setPageSize] = useState(initialPageSize)

  const debouncedQ = useDebounced(q)

  useEffect(() => {
    const next = new URLSearchParams()
    if (debouncedQ && debouncedQ.trim().length > 0) next.set('q', debouncedQ)
    next.set('page', String(page))
    next.set('pageSize', String(pageSize))
    setSp(next, { replace: true })
  }, [debouncedQ, page, pageSize, setSp])

  const search = useQuery({
    queryKey: qk.media(debouncedQ, page, pageSize),
    queryFn: ({ signal }) => searchMedia({ q: debouncedQ, page, pageSize }, { signal }),
    keepPreviousData: true,
    enabled: !!debouncedQ && debouncedQ.trim().length > 0,
  })

  const itemsRaw = useMemo(
    () => search.data?.collection?.items ?? [],
    [search.data]
  )
  const total = useMemo(
    () => Number(search.data?.collection?.metadata?.total_hits ?? 0),
    [search.data]
  )

  const items = itemsRaw

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const showingStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const showingEnd = total === 0 ? 0 : (page - 1) * pageSize + items.length

  const [lbOpen, setLbOpen] = useState(false)
  const [lbIndex, setLbIndex] = useState(0)
  const lbItems = useMemo(() => items.map((it) => {
    const data = it?.data?.[0]
    const title = data?.title || 'Untitled'
    const thumb = pickItemThumb(it)
    const subtitle = data?.date_created ? data.date_created.slice(0, 10) : ''
    return { src: thumb, title, subtitle, href: thumb }
  }), [items])

  const showSkeleton = (search.isLoading && items.length === 0)

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems="center">
        <TextField
          label="Search NASA Media"
          value={q}
          onChange={e => { setQ(e.target.value); setPage(1) }}
          fullWidth
          placeholder="e.g., nebula, Apollo 11, Saturn V…"
        />

        <TextField
          select
          label="Items to show"
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          sx={{ width: { xs: '100%', sm: 180 } }}
          InputLabelProps={{ shrink: true }}
        >
          {PAGE_SIZE_OPTIONS.map(ps => <MenuItem key={ps} value={ps}>{ps}</MenuItem>)}
        </TextField>
      </Stack>

      {showSkeleton && (
        <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 2 }}>
          {Array.from({ length: Math.min(pageSize, 12) }).map((_, i) => (
            <Card key={i}>
              <Skeleton variant="rectangular" height={160} />
              <CardContent>
                <Skeleton width="80%" />
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {search.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {search.error?.message || 'Failed to load media.'}
        </Alert>
      )}

      {!search.isLoading && !search.isError && items.length === 0 && debouncedQ?.trim() && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No results for “{debouncedQ}”. Try a different query.
        </Alert>
      )}

      {!!items.length && (
        <>
          <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
            Showing {showingStart}–{Math.min(showingEnd, total).toLocaleString()} of {total.toLocaleString()} results
          </Typography>

          <Box
            sx={{
              mt: 1.5,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
                xl: 'repeat(5, 1fr)'
              },
              gap: 2
            }}
          >
            {items.map((it, idx) => {
              const data = it?.data?.[0]
              const title = data?.title || 'Untitled'
              const key = data?.nasa_id ?? idx
              const thumb = pickItemThumb(it)
              return (
                <Card
                  key={key}
                  sx={{ overflow: 'hidden', bgcolor: 'background.paper', cursor: thumb ? 'zoom-in' : 'default' }}
                >
                  {thumb ? (
                    <CardMedia
                      component="img"
                      image={thumb}
                      alt={title}
                      loading="lazy"
                      sx={{
                        aspectRatio: '16 / 10',
                        objectFit: 'cover',
                        filter: 'none !important',
                        transform: 'none !important'
                      }}
                      onClick={() => { setLbIndex(idx); setLbOpen(true) }}
                    />
                  ) : (
                    <Box sx={{ aspectRatio: '16 / 10', bgcolor: '#111' }} />
                  )}
                  <CardContent sx={{ py: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" noWrap title={title}>
                      {title}
                    </Typography>
                  </CardContent>
                </Card>
              )
            })}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, p) => setPage(p)}
              variant="outlined"
              shape="rounded"
            />
          </Box>

          <Lightbox
            open={lbOpen}
            items={lbItems}
            index={lbIndex}
            onClose={() => setLbOpen(false)}
            onIndex={setLbIndex}
          />
        </>
      )}
    </Box>
  )
}
