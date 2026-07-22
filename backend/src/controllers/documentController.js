import {
  createDocumentRecord,
  updateDocumentStatus,
  getUserDocuments,
  deleteDocument as deleteDocService,
} from '../services/documentService.js';
import { extractTextFromFile } from '../services/textExtractionService.js';
import { removeFileSafely } from '../utils/fileUtils.js';

/**
 * POST /api/documents/upload
 * Handles document file upload, creates record, extracts text, cleans up temp file.
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

    try {
      // 2. Extract and clean text from document
      const { extractedText, textLength } = await extractTextFromFile({
        filePath,
        mimeType: mimetype,
        originalName: originalname,
      });

      // 3. Mark status as "READY" and store text length as metadata
      const updatedDoc = await updateDocumentStatus(docRecord.id, {
        status: 'READY',
        textLength,
      });

      // 4. Safely remove temporary file from disk
      await removeFileSafely(filePath);

      // 5. Generate first ~300 chars preview of extracted text
      const extractedTextPreview = extractedText.slice(0, 300);

      return res.status(201).json({
        document: updatedDoc,
        extractedTextPreview,
      });
    } catch (extractError) {
      // Mark document as FAILED if text extraction failed
      if (docRecord) {
        await updateDocumentStatus(docRecord.id, { status: 'FAILED' });
      }

      // Safely cleanup temporary file
      await removeFileSafely(filePath);

      return res.status(400).json({
        error: extractError.message || 'Failed to extract text from document.',
        documentId: docRecord ? docRecord.id : null,
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
