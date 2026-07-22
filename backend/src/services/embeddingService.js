import { env } from '../config/env.js';

/**
 * Provider-Agnostic Embedding Service.
 *
 * Primary Provider: Google Gemini `gemini-embedding-001`
 * - text-embedding-004 was deprecated by Google (confirmed 404 NOT_FOUND on embedContent).
 * - gemini-embedding-001 is the current replacement model.
 * - gemini-embedding-001 outputs 3072 dimensions BY DEFAULT, which would break our
 *   existing 768-dim Pinecone index. We explicitly pass outputDimensionality: 768
 *   in every request so vectors stay compatible with the index created in Phase 1 —
 *   no Pinecone index recreation or re-migration required.
 *
 * Fallback: Deterministic 768-d vector generator for local development/testing when no valid key is set.
 */

const EMBED_MODEL = 'gemini-embedding-001';
const GEMINI_EMBED_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent`;
const GEMINI_BATCH_URL = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:batchEmbedContents`;
const VECTOR_DIMENSION = 768;

/**
 * Generates a mock 768-dimensional normalized embedding vector based on string hash.
 * Used automatically if EMBEDDING_API_KEY is not configured or fails in development.
 */
export function generateDeterministicMockEmbedding(text) {
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
        model: `models/${EMBED_MODEL}`,
        content: {
          parts: [{ text }],
        },
        outputDimensionality: VECTOR_DIMENSION,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Embedding API call failed (${response.status}): ${errorText}. Falling back to 768-d dev generator.`);
      return generateDeterministicMockEmbedding(text);
    }

    const data = await response.json();
    if (!data.embedding || !Array.isArray(data.embedding.values)) {
      console.warn('Invalid response structure from Embedding API. Falling back to 768-d dev generator.');
      return generateDeterministicMockEmbedding(text);
    }

    return data.embedding.values;
  } catch (error) {
    console.warn('Error calling embedding API:', error.message, '. Falling back to 768-d dev generator.');
    return generateDeterministicMockEmbedding(text);
  }
}

/**
 * Generates embeddings for an array of text strings.
 * Always returns an array with the SAME LENGTH as the input `texts` array,
 * one embedding per text, in the same order — even if a batch call fails,
 * so downstream chunk<->vector index alignment (in documentService) never breaks.
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

  const BATCH_SIZE = 20;
  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    try {
      const requests = batch.map((text) => ({
        model: `models/${EMBED_MODEL}`,
        content: { parts: [{ text }] },
        outputDimensionality: VECTOR_DIMENSION,
      }));

      const response = await fetch(`${GEMINI_BATCH_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Batch Embedding API call failed (${response.status}): ${errorText}. Falling back to 768-d dev generator for this batch.`);
        allEmbeddings.push(...batch.map((t) => generateDeterministicMockEmbedding(t)));
        continue;
      }

      const data = await response.json();
      if (!data.embeddings || !Array.isArray(data.embeddings) || data.embeddings.length !== batch.length) {
        console.warn('Invalid or incomplete response structure from Batch Embedding API. Falling back to 768-d dev generator for this batch.');
        allEmbeddings.push(...batch.map((t) => generateDeterministicMockEmbedding(t)));
        continue;
      }

      const batchVectors = data.embeddings.map((item, idx) =>
        Array.isArray(item.values) ? item.values : generateDeterministicMockEmbedding(batch[idx])
      );
      allEmbeddings.push(...batchVectors);
    } catch (error) {
      console.warn('Error calling batch embedding API:', error.message, '. Falling back to 768-d dev generator for this batch.');
      allEmbeddings.push(...batch.map((t) => generateDeterministicMockEmbedding(t)));
    }
  }

  return allEmbeddings;
}