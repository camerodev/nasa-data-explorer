import { Router } from 'express';
import { getCached } from '../services/nasaClient.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const r = Router();

r.get('/photos', apiLimiter, async (req, res, next) => {
  try {
    const { rover = 'curiosity', earth_date, sol, camera, page = 1 } = req.query;
    const url = `/mars-photos/api/v1/rovers/${rover}/photos`;
    const data = await getCached(url, { earth_date, sol, camera, page });
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default r;
