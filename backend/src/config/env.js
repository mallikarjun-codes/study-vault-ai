import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || '',
  pineconeApiKey: process.env.PINECONE_API_KEY || '',
  pineconeIndexName: process.env.PINECONE_INDEX_NAME || 'study-vault-index',
  jwtSecret: process.env.JWT_SECRET || 'change_this_secret_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
