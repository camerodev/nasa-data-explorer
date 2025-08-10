import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box, TextField, Typography, Chip, Stack, Card, Skeleton,
  Drawer, List, ListItem, ListItemText, Button, Alert
} from '@mui/material'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'
import { getNeoFeed } from '../api/nasa'
import { qk } from '../api/keys'

const toYmd = d => d.toISOString().slice(0, 10)
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const minDate = (a, b) => (a < b ? a : b)

function chunkRange(start, end) {
  const chunks = []
  let s = new Date(start)
  const E = new Date(end)
  while (s <= E) {
    const e = minDate(addDays(s, 6), E)
    chunks.push([toYmd(s), toYmd(e)])
    s = addDays(e, 1)
  }
  return chunks
}

export default function Neo() {
  const today = new Date()
  const startDefault = addDays(today, -6)

  const [start, setStart] = useState(toYmd(startDefault))
  const [end, setEnd] = useState(toYmd(today))

  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)

  const q = useQuery({
    queryKey: qk.neo(start, end),
    queryFn: async () => {
      const chunks = chunkRange(start, end)
      const all = []
      for (const [s, e] of chunks) {
        const data = await getNeoFeed({ start_date: s, end_date: e })
        all.push(...(data?.list ?? []))
      }
      return { list: all }
    }
  })

  const countsByDate = useMemo(() => {
    return (q.data?.list || []).reduce((acc, it) => {
      acc[it.date] = (acc[it.date] || 0) + 1
      return acc
    }, {})
  }, [q.data])

  const sortedDates = useMemo(
    () => Object.keys(countsByDate).sort((a, b) => new Date(a) - new Date(b)),
    [countsByDate]
  )

  const chart = useMemo(
    () => sortedDates.map(d => ({ date: d, count: countsByDate[d] })),
    [sortedDates, countsByDate]
  )

  const hazardous = useMemo(
    () => (q.data?.list || []).filter(i => i.hazardous).length,
    [q.data]
  )

  const handlePointClick = (payload) => {
    const date = payload?.activeLabel
    if (date) { setSelectedDate(date); setOpen(true) }
  }

  const quickSet = (days) => {
    const e = new Date()
    const s = addDays(e, -(days - 1))
    setStart(toYmd(s))
    setEnd(toYmd(e))
  }

  return (
    <Box>
      <Stack direction={{ xs: 'column', md: 'row' }} gap={2} alignItems="center">
        <TextField label="Start" type="date" value={start} onChange={e => setStart(e.target.value)} />
        <TextField label="End" type="date" value={end} onChange={e => setEnd(e.target.value)} />
        <Stack direction="row" gap={1}>
          <Button size="small" variant="outlined" onClick={() => quickSet(3)}>Last 3 days</Button>
          <Button size="small" variant="outlined" onClick={() => quickSet(7)}>Last 7 days</Button>
        </Stack>
      </Stack>

      {q.isLoading && (
        <Card sx={{ mt: 2, p: { xs: 2, md: 3 } }}>
          <Skeleton variant="rectangular" height={360} />
        </Card>
      )}

      {q.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {q.error?.message || 'Failed to load NEO data.'}
        </Alert>
      )}

      {!!chart.length && !q.isLoading && !q.isError && (
        <>
          <Typography component="div" sx={{ mt: 2 }}>
            Potentially hazardous objects: <Chip component="span" label={hazardous} />
          </Typography>

          <Card sx={{ mt: 2, p: { xs: 2, md: 3 } }}>
            <Box sx={{ width: '100%', height: { xs: 320, md: 420 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart} margin={{ top: 8, right: 24, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    type="category"
                    scale="point"
                    allowDuplicatedCategory={false}
                    interval="preserveStartEnd"
                    minTickGap={16}
                    tickFormatter={(d) => d.slice(5)}
                    tick={{ fill: 'rgba(255,255,255,0.85)' }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.25)' }}
                    ticks={sortedDates}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(d) =>
                      new Date(d + 'T00:00:00Z').toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })
                    }
                  />
                  <Line type="monotone" dataKey="count" dot onClick={handlePointClick} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>

          <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
            <Box sx={{ width: 380, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Objects on {selectedDate}</Typography>
              <List dense>
                {(q.data?.list || [])
                  .filter(o => o.date === selectedDate)
                  .map((o, i) => (
                    <ListItem key={i}>
                      <ListItemText
                        primary={`${o.name} • ${o.diameter_km ? o.diameter_km.toFixed(2) : '?'} km`}
                        secondary={`Miss: ${isFinite(o.miss_km) ? Math.round(o.miss_km).toLocaleString() : '?'} km • ${o.hazardous ? 'Hazardous' : 'Normal'}`}
                      />
                    </ListItem>
                  ))}
              </List>
            </Box>
          </Drawer>
        </>
      )}

      {!q.isLoading && !q.isError && chart.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No results for this range. Try another period.
        </Alert>
      )}
    </Box>
  )
}
