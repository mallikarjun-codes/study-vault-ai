import { queryVectors } from '../config/pinecone.js';
import { env } from '../config/env.js';

/**
 * Searches Pinecone for top-K vector matches for a given query embedding vector.
 *
 * @param {number[]} queryEmbedding - The query vector array (768 dimensions).
 * @param {Object} options - Search options.
 * @param {string} options.userId - User ID for namespace isolation.
 * @param {string[]} [options.documentIds] - Optional list of document IDs to scope search.
 * @param {number} [options.topK] - Number of top-K results to return (default: env.topK or 8).
 * @returns {Promise<Array<{ id: string, score: number, metadata: object }>>} Matches with scores & metadata.
 */
export async function searchTopK(queryEmbedding, { userId, documentIds = null, topK = null }) {
  const limit = topK || env.topK || 8;
  
  let filter = null;
  if (Array.isArray(documentIds) && documentIds.length > 0) {
    if (documentIds.length === 1) {
      filter = { documentId: { $eq: documentIds[0] } };
    } else {
      filter = { documentId: { $in: documentIds } };
    }
  }

  const matches = await queryVectors(queryEmbedding, userId, limit, filter);
  return matches;
}
