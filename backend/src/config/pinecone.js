import { Pinecone } from '@pinecone-database/pinecone';
import { env } from './env.js';

let pineconeClient = null;

export function getPineconeClient() {
  if (!pineconeClient) {
    if (!env.pineconeApiKey) {
      throw new Error('PINECONE_API_KEY is missing in environment variables.');
    }
    pineconeClient = new Pinecone({
      apiKey: env.pineconeApiKey,
    });
  }
  return pineconeClient;
}

export async function checkPineconeConnection() {
  try {
    if (!env.pineconeApiKey) {
      return false;
    }
    const pc = getPineconeClient();
    const indexName = env.pineconeIndexName;
    
    // Check existing indexes
    const response = await pc.listIndexes();
    const indexes = response.indexes || [];
    const indexExists = indexes.some((idx) => idx.name === indexName);

    if (!indexExists) {
      console.log(`Pinecone index "${indexName}" not found. Initializing creation...`);
      await pc.createIndex({
        name: indexName,
        dimension: 768, // Placeholder dimension until embedding model is finalized in Phase 4
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      });
      console.log(`Pinecone index "${indexName}" created successfully.`);
    }

    return true;
  } catch (error) {
    console.error('Pinecone connection error:', error.message);
    return false;
  }
}
