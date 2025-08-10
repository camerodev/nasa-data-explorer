import { Router } from 'express';
import { getCached } from '../services/nasaClient.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const r = Router();

r.get('/', apiLimiter, async (req, res, next) => {
  try {
    const { date, start_date, end_date, thumbs = true } = req.query;
    const data = await getCached('/planetary/apod', { date, start_date, end_date, thumbs });
    res.json(data);
  } catch (e) {
    next(e);
  }
});

export default r;
