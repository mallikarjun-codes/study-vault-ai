import {
  createChatSession,
  getUserChatSessions,
  getChatSessionById,
  deleteChatSession,
  postMessage,
} from '../services/chatService.js';

export async function createSession(req, res, next) {
  try {
    const { title } = req.body;
    const session = await createChatSession(req.user.id, title);
    return res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
}

export async function getSessions(req, res, next) {
  try {
    const sessions = await getUserChatSessions(req.user.id);
    return res.status(200).json({ sessions });
  } catch (error) {
    next(error);
  }
}

export async function getSession(req, res, next) {
  try {
    const session = await getChatSessionById(req.params.id, req.user.id);
    return res.status(200).json({ session });
  } catch (error) {
    next(error);
  }
}

export async function deleteSession(req, res, next) {
  try {
    const result = await deleteChatSession(req.params.id, req.user.id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { content, documentIds } = req.body;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const result = await postMessage({
      sessionId: req.params.id,
      userId: req.user.id,
      content,
      documentIds: Array.isArray(documentIds) && documentIds.length > 0 ? documentIds : null,
    });

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
