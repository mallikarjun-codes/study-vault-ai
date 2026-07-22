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

    const response = await pc.listIndexes();
    const indexes = response.indexes || [];
    const indexExists = indexes.some((idx) => idx.name === indexName);
    if (!indexExists) {
      console.log(`Pinecone index "${indexName}" not found. Initializing creation...`);
      await pc.createIndex({
        name: indexName,
        dimension: 768,
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

export function getPineconeIndex() {
  const pc = getPineconeClient();
  return pc.index(env.pineconeIndexName);
}

/**
 * Upserts vector records with metadata into Pinecone.
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
 * Queries Pinecone for the Top-K most similar vectors to a query embedding.
 * Added in Phase 5, restored here after being accidentally dropped in a later fix.
 *
 * @param {number[]} queryEmbedding - The query vector (768-d).
 * @param {string} [namespace=''] - Namespace to search within (userId).
 * @param {number} [topK=8] - Number of top matches to retrieve.
 * @param {object} [filter=undefined] - Optional Pinecone metadata filter (e.g. { documentId: { $in: [...] } }).
 * @returns {Promise<Array<{ id: string, score: number, metadata: object }>>}
 */
export async function queryVectors(queryEmbedding, namespace = '', topK = 8, filter = undefined) {
  const index = getPineconeIndex();
  const target = namespace ? index.namespace(namespace) : index;

  const queryRequest = {
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    includeValues: false,
  };

  if (filter) {
    queryRequest.filter = filter;
  }

  const result = await target.query(queryRequest);
  return result.matches || [];
}

/**
 * Deletes vector records by ID from a given namespace.
 * Used when a document is deleted, so its chunks' vectors don't stay
 * orphaned in Pinecone after the corresponding Postgres rows are gone.
 *
 * @param {string[]} ids - Array of vector IDs to delete.
 * @param {string} [namespace=''] - Namespace the vectors live in (userId).
 */
export async function deleteVectors(ids, namespace = '') {
  if (!Array.isArray(ids) || ids.length === 0) {
    return { deleted: 0 };
  }
  const index = getPineconeIndex();
  const target = namespace ? index.namespace(namespace) : index;
  await target.deleteMany(ids);
  return { deleted: ids.length };
}