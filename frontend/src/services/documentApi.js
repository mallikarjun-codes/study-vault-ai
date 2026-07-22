import api from './api.js';

/**
 * Uploads a document file to backend API.
 * 
 * @param {File} file - File object from input
 * @param {Function} onProgress - Optional callback for upload progress (percentage: number)
 * @returns {Promise<{ document: Object, extractedTextPreview: string }>}
 */
export async function uploadDocument(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });

  return response.data;
}

/**
 * Fetches all documents belonging to current user.
 * 
 * @returns {Promise<Array<Object>>}
 */
export async function getDocuments() {
  const response = await api.get('/documents');
  return response.data.documents || [];
}

export const fetchDocuments = getDocuments;

/**
 * Deletes a document by ID.
 * 
 * @param {string} id 
 * @returns {Promise<Object>}
 */
export async function deleteDocument(id) {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
}
