import api from './api.js';

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string }} data
 * @returns {{ user: object, token: string }}
 */
export async function register(data) {
  const response = await api.post('/auth/register', data);
  return response.data;
}

/**
 * Log in an existing user.
 * @param {{ email: string, password: string }} data
 * @returns {{ user: object, token: string }}
 */
export async function login(data) {
  const response = await api.post('/auth/login', data);
  return response.data;
}

/**
 * Fetch the currently authenticated user.
 * @returns {{ user: object }}
 */
export async function getMe() {
  const response = await api.get('/auth/me');
  return response.data;
}
