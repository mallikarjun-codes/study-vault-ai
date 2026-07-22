import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Sign a JWT token with the given payload.
 * @param {object} payload - Data to embed in the token (e.g. { id, email })
 * @returns {string} Signed JWT token
 */
export function signToken(payload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

/**
 * Verify a JWT token and return the decoded payload.
 * @param {string} token
 * @returns {object} Decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError} if invalid or expired
 */
export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
