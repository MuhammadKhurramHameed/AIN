import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import intakeRoutes from './routes/intakeRoutes.js';
import programmeRoutes from './routes/programmeRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import trackRoutes from './routes/trackRoutes.js';
import certRoutes from './routes/certRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import trainerRoutes from './routes/trainerRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import kanbanRoutes from './routes/kanbanRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';
import cohortRoutes from './routes/cohortRoutes.js';
import telemetryRoutes from './routes/telemetryRoutes.js';
import assessmentRoutes from './routes/assessmentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import securityRoutes from './routes/securityRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    appName: process.env.APP_NAME || 'National AI Advancement Initiative LMS',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/intake', intakeRoutes);
app.use('/api/v1/programme', programmeRoutes);
app.use('/api/v1/partners', partnerRoutes);
app.use('/api/v1/tracks', trackRoutes);
app.use('/api/v1/certificates', certRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/trainers', trainerRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/kanban', kanbanRoutes);
app.use('/api/v1/questions', questionRoutes);
app.use('/api/v1/integrations', integrationRoutes);
app.use('/api/v1/cohorts', cohortRoutes);
app.use('/api/v1/telemetry', telemetryRoutes);
app.use('/api/v1/assessment', assessmentRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/security', securityRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[Express Error]', err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`[Synapse LMS Express Backend] Server running on http://localhost:${PORT}`);
});
