/**
 * System prompt template for Groq LLM RAG answering.
 */
export const SYSTEM_PROMPT = `You are Study Vault AI, an intelligent personal knowledge and study assistant.
Your sole job is to answer user questions accurately and comprehensively based strictly on the provided context blocks retrieved from their uploaded study documents.

STRICT INSTRUCTIONS:
1. Answer strictly using ONLY the provided context blocks. Do not invent, extrapolate, or use outside knowledge.
2. If the retrieved context blocks do not contain enough relevant information to answer the question, respond with: "The uploaded knowledge base does not contain enough information to answer this question."
3. Cite your sources in the text using format "[Source: DocumentName, Chunk #Index]" whenever stating facts from a chunk.
4. Keep your answer clear, readable, and structured using markdown formatting.`;

/**
 * Formats retrieved Pinecone match chunks into structured context blocks for the LLM prompt.
 *
 * @param {Array<{ metadata: object, score: number }>} matches - Retrieved Pinecone vector matches.
 * @param {Object.<string, string>} documentMap - Map of documentId -> documentName.
 * @returns {string} Formatted context block text.
 */
export function formatContext(matches, documentMap = {}) {
  if (!matches || matches.length === 0) {
    return 'No context chunks retrieved.';
  }

  return matches
    .map((match, idx) => {
      const docId = match.metadata?.documentId;
      const docName = documentMap[docId] || match.metadata?.documentName || 'Document';
      const chunkIdx = match.metadata?.chunkIndex ?? idx;
      const content = match.metadata?.content || '';

      return `--- [Source: ${docName}, Chunk #${chunkIdx}] ---\n${content}`;
    })
    .join('\n\n');
}
