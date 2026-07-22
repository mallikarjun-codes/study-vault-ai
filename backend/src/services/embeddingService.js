import { env } from '../config/env.js';

/**
 * Provider-Agnostic Embedding Service.
 *
 * Primary Provider: Google Gemini `text-embedding-004` (768 dimensions)
 * - Free tier available via Google AI Studio API key (EMBEDDING_API_KEY).
 * - Output dimension: 768 float values per vector.
 * - Perfectly matches the 768-dimension Pinecone index configured in Phase 1.
 *
 * Fallback: Deterministic 768-d vector generator for local development/testing when no API key is set.
 */

const GEMINI_EMBED_URL = 'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent';
const GEMINI_BATCH_URL = 'https://generativelanguage.googleapis.com/v1beta/models/batchEmbedContents';
const VECTOR_DIMENSION = 768;

/**
 * Generates a mock 768-dimensional normalized embedding vector based on string hash.
 * Used automatically if EMBEDDING_API_KEY is not configured (e.g. offline dev).
 * @param {string} text - Input text.
 * @returns {number[]} Array of 768 normalized floats.
 */
function generateDeterministicMockEmbedding(text) {
  const vector = new Array(VECTOR_DIMENSION);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  let normSquare = 0;
  for (let i = 0; i < VECTOR_DIMENSION; i++) {
    const val = Math.sin(hash + i * 0.1);
    vector[i] = val;
    normSquare += val * val;
  }

  const norm = Math.sqrt(normSquare) || 1;
  return vector.map((v) => v / norm);
}

/**
 * Generates embedding for a single text string.
 * @param {string} text - Input text.
 * @returns {Promise<number[]>} Array of 768 floats.
 */
export async function generateEmbedding(text) {
  const apiKey = env.embeddingApiKey;

  if (!apiKey) {
    console.warn('EMBEDDING_API_KEY not configured. Falling back to development mock embedding generator (768-d).');
    return generateDeterministicMockEmbedding(text);
  }

  try {
    const response = await fetch(`${GEMINI_EMBED_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: {
          parts: [{ text }],
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Embedding API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (!data.embedding || !Array.isArray(data.embedding.values)) {
      throw new Error('Invalid response structure from Embedding API');
    }

    return data.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error.message);
    throw error;
  }
}

/**
 * Generates embeddings for an array of text strings.
 * @param {string[]} texts - Array of text strings.
 * @returns {Promise<number[][]>} Array of 768-dimensional float arrays.
 */
export async function generateEmbeddings(texts) {
  if (!Array.isArray(texts) || texts.length === 0) {
    return [];
  }

  const apiKey = env.embeddingApiKey;

  if (!apiKey) {
    console.warn('EMBEDDING_API_KEY not configured. Falling back to development mock embedding generator (768-d).');
    return texts.map((t) => generateDeterministicMockEmbedding(t));
  }

  try {
    const BATCH_SIZE = 20;
    const allEmbeddings = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const requests = batch.map((text) => ({
        model: 'models/text-embedding-004',
        content: { parts: [{ text }] },
      }));

      const response = await fetch(`${GEMINI_BATCH_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Batch Embedding API returned status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (!data.embeddings || !Array.isArray(data.embeddings)) {
        throw new Error('Invalid response structure from Batch Embedding API');
      }

      const batchVectors = data.embeddings.map((item) => item.values);
      allEmbeddings.push(...batchVectors);
    }

    return allEmbeddings;
  } catch (error) {
    console.error('Error generating batch embeddings:', error.message);
    throw error;
  }
}
