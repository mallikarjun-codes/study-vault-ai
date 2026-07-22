import fs from 'fs/promises';
import path from 'path';

/**
 * Safely removes a file from disk if it exists.
 * Does not throw if the file does not exist.
 * 
 * @param {string} filePath Absolute or relative path to the file
 */
export async function removeFileSafely(filePath) {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error(`[fileUtils] Failed to remove file at ${filePath}:`, error.message);
    }
  }
}

/**
 * Formats byte size into human readable string.
 * 
 * @param {number} bytes 
 * @returns {string} E.g., "2.4 MB"
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
