import { prisma } from '../config/db.js';
import { chunkText } from './chunkingService.js';
import { generateEmbeddings } from './embeddingService.js';
import { upsertVectors } from '../config/pinecone.js';
import { env } from '../config/env.js';

/**
 * Creates an initial Document record with status "PROCESSING".
 */
export async function createDocumentRecord({ userId, name, mimeType, fileSize }) {
  return await prisma.document.create({
    data: {
      userId,
      name,
      mimeType,
      fileSize: fileSize || null,
      status: 'PROCESSING',
    },
  });
}

/**
 * Updates status and metadata for a document record.
 */
export async function updateDocumentStatus(id, { status, textLength = null }) {
  return await prisma.document.update({
    where: { id },
    data: {
      status,
      textLength: textLength !== null ? textLength : undefined,
    },
  });
}

/**
 * Handles text chunking, embedding generation, Postgres DocumentChunk storage,
 * and Pinecone vector upsertion for an extracted document.
 *
 * Added in Phase 4.
 */
export async function processDocumentIngestion({ documentId, userId, extractedText, textLength }) {
  // 1. Chunk extracted text using chunkingService
  const chunks = chunkText(extractedText, {
    chunkSize: env.chunkSize,
    chunkOverlap: env.chunkOverlap,
  });

  if (chunks.length === 0) {
    return await updateDocumentStatus(documentId, {
      status: 'READY',
      textLength,
    });
  }

  // 2. Generate embeddings for all chunk texts using embeddingService
  const chunkTexts = chunks.map((c) => c.content);
  const embeddings = await generateEmbeddings(chunkTexts);

  // 3. Store chunk records in Postgres DocumentChunk table
  const chunkRecords = await prisma.$transaction(
    chunks.map((chunk) =>
      prisma.documentChunk.create({
        data: {
          documentId,
          userId,
          content: chunk.content,
          chunkIndex: chunk.chunkIndex,
        },
      })
    )
  );

  // 4. Prepare vectors for Pinecone upsert with metadata
  const vectors = chunkRecords.map((chunkRecord, idx) => ({
    id: chunkRecord.id,
    values: embeddings[idx],
    metadata: {
      userId,
      documentId,
      chunkIndex: chunkRecord.chunkIndex,
      content: chunkRecord.content.slice(0, 1000), // metadata safety bound
    },
  }));

  // 5. Upsert vectors into Pinecone under user's namespace
  await upsertVectors(vectors, userId);

  // 6. Save pineconeVectorId back to DocumentChunk in Postgres
  await Promise.all(
    chunkRecords.map((chunkRecord) =>
      prisma.documentChunk.update({
        where: { id: chunkRecord.id },
        data: { pineconeVectorId: chunkRecord.id },
      })
    )
  );

  // 7. Update Document status to READY
  return await updateDocumentStatus(documentId, {
    status: 'READY',
    textLength,
  });
}

/**
 * Fetches all documents belonging to a user.
 */
export async function getUserDocuments(userId) {
  return await prisma.document.findMany({
    where: { userId },
    select: {
      id: true,
      userId: true,
      name: true,
      mimeType: true,
      fileSize: true,
      status: true,
      textLength: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Retrieves a single document by ID.
 */
export async function getDocumentById(id) {
  return await prisma.document.findUnique({
    where: { id },
  });
}

/**
 * Deletes a document if owned by the specifying user.
 */
export async function deleteDocument(id, userId) {
  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) {
    const error = new Error('Document not found');
    error.statusCode = 404;
    throw error;
  }

  if (document.userId !== userId) {
    const error = new Error('Forbidden: You do not have permission to delete this document.');
    error.statusCode = 403;
    throw error;
  }

  await prisma.document.delete({
    where: { id },
  });

  return { id, message: 'Document deleted successfully' };
}
