import express from 'express'
import axios from 'axios'

const router = express.Router()

router.get('/search', async (req, res) => {
  try {
    const {
      q = '',
      page = 1,
      pageSize = 25,
      media_type = 'image',
      year_start,
      year_end,
    } = req.query

    const uiPage = Math.max(1, parseInt(page, 10) || 1)
    const uiPageSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 25))

    const NASA_PAGE_SIZE = 100

    async function fetchNasa(pageNum) {
      const params = {
        q,
        media_type,
        page: pageNum,
      }
      if (year_start) params.year_start = year_start
      if (year_end) params.year_end = year_end

      const { data } = await axios.get('https://images-api.nasa.gov/search', { params })
      const items = data?.collection?.items ?? []
      const totalHits = Number(data?.collection?.metadata?.total_hits ?? 0)
      return { items, totalHits }
    }

    const uiStartIndex = (uiPage - 1) * uiPageSize        
    const uiEndIndexExclusive = uiStartIndex + uiPageSize 

    const firstNasaPage = Math.floor(uiStartIndex / NASA_PAGE_SIZE) + 1
    const lastNasaPage = Math.floor((uiEndIndexExclusive - 1) / NASA_PAGE_SIZE) + 1

    let combined = []
    let totalHits = 0

    for (let p = firstNasaPage; p <= lastNasaPage; p++) {
      const { items, totalHits: th } = await fetchNasa(p)
      totalHits = th
      combined = combined.concat(items)
    }

    const combinedStart = uiStartIndex - (firstNasaPage - 1) * NASA_PAGE_SIZE
    const slice = combined.slice(
      Math.max(0, combinedStart),
      Math.max(0, combinedStart) + uiPageSize
    )

    res.json({
      collection: {
        version: '1.0',
        href: 'https://images-api.nasa.gov/search',
        metadata: { total_hits: totalHits },
        items: slice,
      },
      page: uiPage,
      pageSize: uiPageSize,
    })
  } catch (err) {
    console.error('MEDIA /search error', err?.response?.data || err.message)
    res.status(500).json({ error: 'Failed to search NASA media.' })
  }
})

export default router
