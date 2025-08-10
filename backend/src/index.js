import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import apod from './routes/apod.js';
import mars from './routes/mars.js';
import neo from './routes/neo.js';
import media from './routes/media.js';
import error from './middleware/error.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/apod', apod);
app.use('/api/mars', mars);
app.use('/api/neo', neo);
app.use('/api/media', media);

app.use(error);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
