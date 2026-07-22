import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach token on every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sv_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function fetchHealthStatus() {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    }
    return {
      status: 'unreachable',
      db: false,
      pinecone: false,
      error: error.message,
    };
  }
}

export default api;
