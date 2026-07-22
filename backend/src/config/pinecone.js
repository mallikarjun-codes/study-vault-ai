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
        dimension: 768, // Finalized in Phase 4: matches Google Gemini text-embedding-004
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

/**
 * Returns a reference handle to the configured Pinecone index.
 */
export function getPineconeIndex() {
  const pc = getPineconeClient();
  return pc.index(env.pineconeIndexName);
}

/**
 * Upserts vector records with metadata into Pinecone.
 *
 * @param {Array<{ id: string, values: number[], metadata: object }>} vectors - Vector objects array.
 * @param {string} [namespace=''] - Namespace to isolate vectors (e.g. userId).
 * @returns {Promise<string[]>} Array of upserted vector IDs.
 */
export async function upsertVectors(vectors, namespace = '') {
  if (!Array.isArray(vectors) || vectors.length === 0) {
    return [];
  }

  const index = getPineconeIndex();
  const target = namespace ? index.namespace(namespace) : index;

  await target.upsert(vectors);
  return vectors.map((v) => v.id);
}

/**
 * Queries Pinecone for nearest vector matches under a specified namespace.
 * Added in Phase 5.
 *
 * @param {number[]} queryVector - The 768-d query embedding vector.
 * @param {string} [namespace=''] - Namespace to query within (e.g. userId).
 * @param {number} [topK=8] - Number of top matches to return.
 * @param {object} [filter=null] - Optional metadata filter (e.g. documentId filtering).
 * @returns {Promise<Array<{ id: string, score: number, metadata: object }>>} Array of matching objects.
 */
export async function queryVectors(queryVector, namespace = '', topK = 8, filter = null) {
  if (!queryVector || !Array.isArray(queryVector)) {
    return [];
  }

  const index = getPineconeIndex();
  const target = namespace ? index.namespace(namespace) : index;

  const queryOptions = {
    vector: queryVector,
    topK,
    includeMetadata: true,
  };

  if (filter && Object.keys(filter).length > 0) {
    queryOptions.filter = filter;
  }

  const response = await target.query(queryOptions);
  return response.matches || [];
}
