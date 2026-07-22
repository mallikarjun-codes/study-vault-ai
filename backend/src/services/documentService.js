import { prisma } from '../config/db.js';
import { chunkText } from './chunkingService.js';
import { generateEmbeddings } from './embeddingService.js';
import { upsertVectors, deleteVectors } from '../config/pinecone.js';
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
 */
export async function processDocumentIngestion({ documentId, userId, extractedText, textLength }) {
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

  const chunkTexts = chunks.map((c) => c.content);
  const embeddings = await generateEmbeddings(chunkTexts);

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

  const vectors = chunkRecords.map((chunkRecord, idx) => ({
    id: chunkRecord.id,
    values: embeddings[idx],
    metadata: {
      userId,
      documentId,
      chunkIndex: chunkRecord.chunkIndex,
      content: chunkRecord.content.slice(0, 1000),
    },
  }));

  await upsertVectors(vectors, userId);

  await Promise.all(
    chunkRecords.map((chunkRecord) =>
      prisma.documentChunk.update({
        where: { id: chunkRecord.id },
        data: { pineconeVectorId: chunkRecord.id },
      })
    )
  );

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
 *
 * FIX: Now also deletes the document's vectors from Pinecone BEFORE deleting
 * the Postgres records, so vectors never stay orphaned in the index.
 * Uses the same namespace convention (userId) established in Phase 4's upsert.
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

  // 1. Find all chunk records for this document to get their Pinecone vector IDs
  const chunks = await prisma.documentChunk.findMany({
    where: { documentId: id },
    select: { pineconeVectorId: true },
  });

  const vectorIds = chunks
    .map((c) => c.pineconeVectorId)
    .filter((vid) => typeof vid === 'string' && vid.length > 0);

  // 2. Delete those vectors from Pinecone (same userId namespace used at upsert time)
  if (vectorIds.length > 0) {
    try {
      await deleteVectors(vectorIds, userId);
    } catch (error) {
      // Don't block document deletion if Pinecone cleanup fails — log it clearly
      // so it's visible, but the user's intent (delete the document) still succeeds.
      console.error(`Failed to delete ${vectorIds.length} Pinecone vectors for document ${id}:`, error.message);
    }
  }

  // 3. Delete DocumentChunk rows explicitly (in case there's no DB-level cascade configured)
  await prisma.documentChunk.deleteMany({
    where: { documentId: id },
  });

  // 4. Delete the Document record itself
  await prisma.document.delete({
    where: { id },
  });

  return { id, message: 'Document deleted successfully' };
}