const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const executeRouter = require('./routes/execute');
const lectureRouter = require('./routes/data/lecture');
const courseRouter = require('./routes/data/course');
const {requestLogger} = require('./middleware/requestLogger');
const {errorHandler} = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', methods: ['GET', 'POST'] }));
app.use(express.json({ limit: '50kb' }));
app.use(requestLogger);
app.use('/api', rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false }));
app.use('/api/execute', executeRouter);
app.use('/api/lectures', lectureRouter);
app.use('/api/courses', courseRouter);
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use((_req, res) => res.status(404).json({ error: 'Rroute not found' }));
app.use(errorHandler);

module.exports = app;