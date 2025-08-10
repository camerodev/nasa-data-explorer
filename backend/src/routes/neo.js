import { Router } from 'express';
import { getCached } from '../services/nasaClient.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const r = Router();

r.get('/feed', apiLimiter, async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const data = await getCached('/neo/rest/v1/feed', { start_date, end_date });

    const list = Object.entries(data.near_earth_objects || {}).flatMap(([date, arr]) =>
      arr.map(o => ({
        date,
        name: o.name,
        hazardous: o.is_potentially_hazardous_asteroid,
        diameter_km: o.estimated_diameter?.kilometers?.estimated_diameter_max ?? null,
        miss_km: Number(o.close_approach_data?.[0]?.miss_distance?.kilometers ?? NaN)
      }))
    );

    res.json({ count: list.length, list });
  } catch (e) {
    next(e);
  }
});

export default r;
