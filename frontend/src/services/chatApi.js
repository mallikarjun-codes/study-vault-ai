import api from './api.js';

export async function fetchChatSessions() {
  const response = await api.get('/chats');
  return response.data.sessions;
}

export async function createChatSession(title = 'New Chat') {
  const response = await api.post('/chats', { title });
  return response.data.session;
}

export async function fetchChatSession(id) {
  const response = await api.get(`/chats/${id}`);
  return response.data.session;
}

export async function deleteChatSession(id) {
  const response = await api.delete(`/chats/${id}`);
  return response.data;
}

export async function sendMessage(sessionId, { content, documentIds }) {
  const response = await api.post(`/chats/${sessionId}/messages`, {
    content,
    documentIds,
  });
  return response.data;
}
