import app from './app.js';
import { env } from './config/env.js';

const PORT = env.port;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`Health check endpoint: http://localhost:${PORT}/api/health`);
});
