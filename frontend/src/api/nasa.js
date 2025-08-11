import { api } from './client'

export async function getApod({ date, thumbs = true } = {}, { signal } = {}) {
  const { data } = await api.get('/api/apod', { params: { date, thumbs }, signal })
  return data
}

export async function getMarsPhotos(
  { rover, earth_date, camera, page = 1 } = {},
  { signal } = {}
) {
  const params = { rover, earth_date, page }
  if (camera && String(camera).trim()) params.camera = camera
  const { data } = await api.get('/api/mars/photos', { params, signal })
  return data?.photos ?? []
}

export async function getNeoFeed({ start_date, end_date } = {}, { signal } = {}) {
  const { data } = await api.get('/api/neo/feed', { params: { start_date, end_date }, signal })
  return data
}

export async function searchMedia(
  { q = '', page = 1, pageSize = 50, media_type = 'image', year_start, year_end } = {},
  { signal } = {}
) {
  const params = { q, page, pageSize, media_type }
  if (year_start) params.year_start = year_start
  if (year_end) params.year_end = year_end

  const { data } = await api.get('/api/media/search', { params, signal })
  return data
}
