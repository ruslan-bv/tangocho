import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

/**
 * Wraps async route handlers to catch errors and forward them to Express error middleware.
 * Eliminates the need for try-catch blocks in every route handler.
 */
export const asyncHandler = (fn: AsyncRequestHandler): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
