import { generateEmbedding } from './embeddingService.js';
import { searchTopK } from './vectorSearchService.js';
import { generateAnswer } from './groqService.js';
import { formatContext } from '../utils/prompts.js';
import { prisma } from '../config/db.js';

/**
 * Executes full RAG Retrieval + Generation Pipeline:
 * 1. Question embedding generation
 * 2. Top-K similarity search in Pinecone
 * 3. Document name lookup from Postgres
 * 4. Context formatting
 * 5. Grounded LLM answer generation via Groq
 * 6. Source citations metadata assembly
 *
 * @param {Object} params
 * @param {string} params.question - The user question text.
 * @param {string} params.userId - User ID for namespace isolation.
 * @param {string[]} [params.documentIds] - Optional array of document IDs to filter.
 * @returns {Promise<{ answer: string, sources: Array<{ documentId: string, documentName: string, chunkIndex: number, score: number }> }>}
 */
export async function answerQuestion({ question, userId, documentIds = null }) {
  // 1. Generate embedding vector for query
  const queryEmbedding = await generateEmbedding(question);

  // 2. Search Top-K vectors in Pinecone under user's namespace
  const matches = await searchTopK(queryEmbedding, {
    userId,
    documentIds,
  });

  // 3. Resolve document names from Postgres
  const retrievedDocIds = [...new Set(matches.map((m) => m.metadata?.documentId).filter(Boolean))];
  const documentMap = {};

  if (retrievedDocIds.length > 0) {
    const docs = await prisma.document.findMany({
      where: { id: { in: retrievedDocIds } },
      select: { id: true, name: true },
    });
    docs.forEach((d) => {
      documentMap[d.id] = d.name;
    });
  }

  // 4. Build context string for prompt
  const context = formatContext(matches, documentMap);

  // 5. Generate answer using Groq LLM
  const answer = await generateAnswer(context, question);

  // 6. Assemble sources list
  const sources = matches.map((m) => {
    const docId = m.metadata?.documentId;
    return {
      documentId: docId || null,
      documentName: documentMap[docId] || 'Document',
      chunkIndex: m.metadata?.chunkIndex ?? 0,
      score: typeof m.score === 'number' ? parseFloat(m.score.toFixed(4)) : 0,
    };
  });

  return { answer, sources };
}
