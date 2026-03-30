const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const executeRouter = require('./routes/execute');
const lectureRouter = require('./routes/data/lecture');
const courseRouter = require('./routes/data/course');
const enrollmentRouter = require('./routes/data/enrollment');
const examRouter = require('./routes/data/exam');
const userRouter = require('./routes/data/user');
const lectureSessionRouter = require('./routes/data/lecture_session');
const taskRouter = require('./routes/data/task');
const {requestLogger} = require('./middleware/requestLogger');
const {errorHandler} = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'] }));
app.use(express.json({ limit: '50kb' }));
app.use(requestLogger);
app.use('/api', rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false }));
app.use('/api/execute', executeRouter);
app.use('/api/lectures', lectureRouter);
app.use('/api/courses', courseRouter);
app.use('/api/enrollments', enrollmentRouter);
app.use('/api/exams', examRouter);
app.use('/api/users', userRouter);
app.use('/api/lecture-sessions', lectureSessionRouter);
app.use('/api/tasks', taskRouter);
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

module.exports = app;