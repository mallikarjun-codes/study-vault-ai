import { env } from '../config/env.js';

/**
 * Splits extracted document text into overlapping text chunks.
 *
 * @param {string} text - The raw text extracted from a document.
 * @param {Object} [options] - Custom options for chunking.
 * @param {number} [options.chunkSize] - Maximum character length per chunk (default from env or 700).
 * @param {number} [options.chunkOverlap] - Character overlap between consecutive chunks (default from env or 100).
 * @returns {Array<{ content: string, chunkIndex: number }>} Array of chunk objects.
 *
 * Splitting Strategy:
 * We use character-based windowing with sentence/paragraph boundary sensitivity:
 * - Character-based chunking is lightweight, fast, deterministic, and avoids external native tokenizer dependencies.
 * - chunkSize = 700 characters corresponds to ~150-180 tokens, optimal for dense RAG context retrieval.
 * - chunkOverlap = 100 characters ensures semantic continuity across chunk boundaries so sentences split across boundaries retain context.
 */
export function chunkText(text, options = {}) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return [];
  }

  const chunkSize = options.chunkSize || env.chunkSize || 700;
  const chunkOverlap = options.chunkOverlap || env.chunkOverlap || 100;

  const sanitizedText = text.trim();
  const chunks = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < sanitizedText.length) {
    let end = start + chunkSize;

    if (end >= sanitizedText.length) {
      const content = sanitizedText.slice(start).trim();
      if (content.length > 0) {
        chunks.push({ content, chunkIndex });
      }
      break;
    }

    // Search for natural sentence or paragraph boundary within the last 100 chars of current window
    const searchWindow = sanitizedText.slice(Math.max(start, end - 100), end);
    const boundaryMatch = searchWindow.search(/[\.\!\?\n](\s+|$)/);

    if (boundaryMatch !== -1) {
      end = Math.max(start, end - 100) + boundaryMatch + 1;
    }

    const content = sanitizedText.slice(start, end).trim();
    if (content.length > 0) {
      chunks.push({ content, chunkIndex });
      chunkIndex++;
    }

    // Step forward by chunkSize - chunkOverlap
    const step = chunkSize - chunkOverlap;
    const nextStart = Math.min(start + (step > 0 ? step : 100), end);

    // Prevent infinite loop if start didn't advance
    if (nextStart <= start) {
      start = end;
    } else {
      start = nextStart;
    }
  }

  return chunks;
}
