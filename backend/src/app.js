import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { checkDbConnection } from './config/db.js';
import { checkPineconeConnection } from './config/pinecone.js';

const app = express();

// Security and middleware configuration
app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(express.json());

// Health Check Route
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

export default app;
