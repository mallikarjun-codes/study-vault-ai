import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { checkDbConnection } from './config/db.js';
import { checkPineconeConnection } from './config/pinecone.js';
import authRoutes from './routes/authRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';

const app = express();

// ─── Core Middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(express.json());

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const [dbConnected, pineconeConnected] = await Promise.all([
    checkDbConnection(),
    checkPineconeConnection(),
  ]);

  const isHealthy = dbConnected && pineconeConnected;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    db: dbConnected,
    pinecone: pineconeConnected,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── Centralized Error Handler (must be last) ────────────────────────────────
app.use(errorMiddleware);

export default app;
