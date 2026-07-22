import { verifyToken } from '../utils/jwt.js';

/**
 * Middleware that validates the Authorization: Bearer <token> header.
 * On success, attaches { id, email } to req.user.
 * On failure, responds with 401.
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Authorization denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ error: 'Invalid token payload. Authorization denied.' });
    }
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid token. Authorization denied.' });
  }
}
