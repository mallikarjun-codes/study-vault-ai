/**
 * Centralized error handler middleware.
 * Must be registered LAST in app.js (after all routes).
 *
 * Handles:
 * - Zod validation errors (from validator middleware)
 * - Custom errors with statusCode
 * - Prisma errors
 * - Generic unhandled errors
 */
export function errorMiddleware(err, req, res, next) {
  // Zod validation errors (forwarded with statusCode 400 from route handlers)
  if (err.isZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Custom application errors with explicit statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: `A record with this ${err.meta?.target?.join(', ')} already exists`,
    });
  }

  // Log unexpected server errors
  console.error('[Unhandled Error]', err);

  return res.status(500).json({ error: 'Internal server error' });
}
