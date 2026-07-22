import { registerSchema, loginSchema } from '../validators/authSchemas.js';
import { registerUser, loginUser, getUserById } from '../services/authService.js';

/**
 * POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const err = new Error('Validation failed');
      err.isZodError = true;
      err.errors = parsed.error.errors;
      return next(err);
    }

    const { user, token } = await registerUser(parsed.data);
    return res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const err = new Error('Validation failed');
      err.isZodError = true;
      err.errors = parsed.error.errors;
      return next(err);
    }

    const { user, token } = await loginUser(parsed.data);
    return res.status(200).json({ user, token });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Protected — requires authMiddleware upstream.
 */
export async function getMe(req, res, next) {
  try {
    const user = await getUserById(req.user.id);
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}
