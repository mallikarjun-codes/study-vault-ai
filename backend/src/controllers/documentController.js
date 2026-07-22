import {
  createDocumentRecord,
  updateDocumentStatus,
  processDocumentIngestion,
  getUserDocuments,
  deleteDocument as deleteDocService,
} from '../services/documentService.js';
import { extractTextFromFile } from '../services/textExtractionService.js';
import { removeFileSafely } from '../utils/fileUtils.js';

/**
 * POST /api/documents/upload
 * Handles document file upload, text extraction, chunking, embedding generation,
 * Postgres chunk storage, Pinecone vector indexing, and temp file cleanup.
 *
 * Extended in Phase 4 to trigger chunking + embedding + vector storage after text extraction.
 */
export async function uploadDocument(req, res, next) {
  let docRecord = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file attached. Please select a valid document to upload.' });
    }

    const { originalname, mimetype, size, path: filePath } = req.file;
    const userId = req.user.id;

    // 1. Create Document record with status "PROCESSING"
    docRecord = await createDocumentRecord({
      userId,
      name: originalname,
      mimeType: mimetype,
      fileSize: size,
    });

    let extractedText = '';
    let textLength = 0;

    // 2. Extract and clean text from document file
    try {
      const extractionResult = await extractTextFromFile({
        filePath,
        mimeType: mimetype,
        originalName: originalname,
      });
      extractedText = extractionResult.extractedText;
      textLength = extractionResult.textLength;
    } catch (extractError) {
      if (docRecord) {
        await updateDocumentStatus(docRecord.id, { status: 'FAILED' });
      }

      await removeFileSafely(filePath);

      return res.status(400).json({
        error: extractError.message || 'Failed to extract text from document.',
        documentId: docRecord ? docRecord.id : null,
      });
    }

    // Safely remove temporary file from disk immediately after extraction
    await removeFileSafely(filePath);

    // 3. Trigger Phase 4 Chunking + Embedding + Pinecone Storage pipeline
    try {
      const updatedDoc = await processDocumentIngestion({
        documentId: docRecord.id,
        userId,
        extractedText,
        textLength,
      });

      const extractedTextPreview = extractedText.slice(0, 300);

      return res.status(201).json({
        document: updatedDoc,
        extractedTextPreview,
      });
    } catch (ingestError) {
      console.error(`Ingestion indexing failed for document ${docRecord.id}:`, ingestError);

      // If chunking / embedding / Pinecone fails, mark status = "FAILED"
      // while keeping Phase 3 extracted text metadata intact
      const failedDoc = await updateDocumentStatus(docRecord.id, {
        status: 'FAILED',
        textLength,
      });

      return res.status(500).json({
        error: `Text extraction succeeded (${textLength} chars), but chunking/vector indexing failed: ${ingestError.message}`,
        document: failedDoc,
      });
    }
  } catch (error) {
    if (req.file && req.file.path) {
      await removeFileSafely(req.file.path);
    }
    next(error);
  }
}

/**
 * GET /api/documents
 * Lists current user's uploaded documents.
 */
export async function getDocuments(req, res, next) {
  try {
    const documents = await getUserDocuments(req.user.id);
    return res.status(200).json({ documents });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/documents/:id
 * Deletes a user's document after verifying ownership.
 */
export async function deleteDocument(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await deleteDocService(id, userId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
