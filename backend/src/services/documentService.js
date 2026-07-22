import { prisma } from '../config/db.js';

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
