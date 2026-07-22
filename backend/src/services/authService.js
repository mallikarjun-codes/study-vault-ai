import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { signToken } from '../utils/jwt.js';

const SALT_ROUNDS = 12;

/**
 * Register a new user.
 * @param {{ name: string, email: string, password: string }} data
 * @returns {{ user: object, token: string }}
 */
export async function registerUser({ name, email, password }) {
  // Check for existing email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('An account with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user record in Postgres
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  const token = signToken({ id: user.id, email: user.email });
  return { user, token };
}

/**
 * Log in an existing user.
 * @param {{ email: string, password: string }} data
 * @returns {{ user: object, token: string }}
 */
export async function loginUser({ email, password }) {
  // Find user (include passwordHash for comparison)
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = signToken({ id: user.id, email: user.email });

  // Return user without passwordHash
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, token };
}

/**
 * Fetch a user by ID — for the /me endpoint.
 * @param {string} userId
 * @returns {object} user without passwordHash
 */
export async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, createdAt: true },
  });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
}
