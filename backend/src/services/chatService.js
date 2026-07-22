import { prisma } from '../config/db.js';
import { answerQuestion } from './ragService.js';

/**
 * Creates a new ChatSession record.
 */
export async function createChatSession(userId, title = 'New Chat') {
  return await prisma.chatSession.create({
    data: {
      userId,
      title,
    },
  });
}

/**
 * Lists all chat sessions belonging to a user.
 */
export async function getUserChatSessions(userId) {
  return await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      userId: true,
      title: true,
      createdAt: true,
      _count: {
        select: { messages: true },
      },
    },
  });
}

/**
 * Retrieves a chat session with all messages after verifying ownership.
 */
export async function getChatSessionById(sessionId, userId) {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!session) {
    const error = new Error('Chat session not found');
    error.statusCode = 404;
    throw error;
  }

  if (session.userId !== userId) {
    const error = new Error('Forbidden: You do not have permission to access this chat session');
    error.statusCode = 403;
    throw error;
  }

  return session;
}

/**
 * Deletes a chat session after verifying ownership.
 */
export async function deleteChatSession(sessionId, userId) {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    const error = new Error('Chat session not found');
    error.statusCode = 404;
    throw error;
  }

  if (session.userId !== userId) {
    const error = new Error('Forbidden: You do not have permission to delete this chat session');
    error.statusCode = 403;
    throw error;
  }

  await prisma.chatSession.delete({
    where: { id: sessionId },
  });

  return { id: sessionId, message: 'Chat session deleted successfully' };
}

/**
 * Main RAG message endpoint handler:
 * Saves user message -> Runs RAG pipeline -> Saves assistant message with sources -> Returns response.
 */
export async function postMessage({ sessionId, userId, content, documentIds = null }) {
  const session = await getChatSessionById(sessionId, userId);

  // 1. Save User message to Postgres
  const userMessage = await prisma.message.create({
    data: {
      sessionId,
      role: 'user',
      content,
    },
  });

  // 2. Auto-title session if it's default "New Chat"
  if (session.title === 'New Chat') {
    const autoTitle = content.length > 30 ? `${content.slice(0, 30)}...` : content;
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title: autoTitle },
    });
  }

  // 3. Execute RAG pipeline
  const { answer, sources } = await answerQuestion({
    question: content,
    userId,
    documentIds,
  });

  // 4. Save Assistant message to Postgres with sources
  const assistantMessage = await prisma.message.create({
    data: {
      sessionId,
      role: 'assistant',
      content: answer,
      sources,
    },
  });

  return {
    userMessage,
    assistantMessage,
  };
}
