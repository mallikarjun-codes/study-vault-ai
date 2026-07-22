import fs from 'fs/promises';
import path from 'path';
import { createRequire } from 'module';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

const require = createRequire(import.meta.url);

/**
 * Parses PDF buffer using PDFParse class or legacy pdf-parse function signature.
 * 
 * @param {Buffer} dataBuffer 
 * @returns {Promise<string>} Extracted text string
 */
async function parsePdfBuffer(dataBuffer) {
  // 1. Check for modern PDFParse class (pdf-parse 2.x+)
  if (typeof PDFParse === 'function') {
    const parser = new PDFParse({ data: new Uint8Array(dataBuffer) });
    const textResult = await parser.getText();
    return textResult.text || '';
  }

  // 2. Fallback for pdf-parse 1.x function signature
  const pdfFn = require('pdf-parse');
  if (typeof pdfFn === 'function') {
    const data = await pdfFn(dataBuffer);
    return data.text || '';
  }

  if (pdfFn && typeof pdfFn.default === 'function') {
    const data = await pdfFn.default(dataBuffer);
    return data.text || '';
  }

  throw new Error('PDF parsing library is not configured properly.');
}

/**
 * Cleans extracted raw text by normalizing whitespace, line breaks, and stripping invalid control characters.
 * 
 * @param {string} rawText 
 * @returns {string} Cleaned text string
 */
export function cleanText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  return rawText
    // Replace carriage returns with standard newlines
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove non-printable control characters except tabs and newlines
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Collapse multiple horizontal spaces/tabs into a single space on each line
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    // Collapse 3 or more consecutive newlines into 2 newlines (preserve paragraph separation)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extracts raw text from a document file based on mimeType or file extension.
 * 
 * @param {Object} params
 * @param {string} params.filePath - Path to uploaded file on disk
 * @param {string} params.mimeType - MIME type of the file
 * @param {string} params.originalName - Original filename (fallback for extension detection)
 * @returns {Promise<{ extractedText: string, textLength: number }>}
 */
export async function extractTextFromFile({ filePath, mimeType, originalName }) {
  const ext = path.extname(originalName || '').toLowerCase();
  let rawText = '';

  if (mimeType === 'application/pdf' || ext === '.pdf') {
    const dataBuffer = await fs.readFile(filePath);
    rawText = await parsePdfBuffer(dataBuffer);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    ext === '.docx' ||
    ext === '.doc'
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    rawText = result.value || '';
  } else if (mimeType === 'text/plain' || ext === '.txt') {
    rawText = await fs.readFile(filePath, 'utf-8');
  } else {
    throw new Error(`Unsupported file type: ${mimeType || ext}`);
  }

  const cleaned = cleanText(rawText);

  if (!cleaned || cleaned.length === 0) {
    throw new Error('Extracted document content is empty. The file may contain only scanned images or unsupported formatting.');
  }

  return {
    extractedText: cleaned,
    textLength: cleaned.length,
  };
}
