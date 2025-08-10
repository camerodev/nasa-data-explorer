import axios from 'axios';
import NodeCache from 'node-cache';

const API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });
const nasa = axios.create({ baseURL: 'https://api.nasa.gov' });

export async function getCached(url, params = {}, ttlSec = 600) {
  const key = `${url}?${new URLSearchParams({ ...params, api_key: API_KEY })}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const { data } = await nasa.get(url, { params: { ...params, api_key: API_KEY } });
  cache.set(key, data, ttlSec);
  return data;
}
