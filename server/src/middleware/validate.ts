import type { Request, Response, NextFunction } from 'express';

/**
 * Validates that a query parameter exists and is not empty.
 */
export const validateQuery = (field: string, message?: string) =>
  (req: Request, res: Response, next: NextFunction) => {
    const value = req.query[field];
    if (!value || !String(value).trim()) {
      return res.status(400).json({
        message: message || `${field} is required`
      });
    }
    next();
  };

/**
 * Validates that required body fields exist.
 */
export const validateBody = (...fields: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    for (const field of fields) {
      const value = req.body[field];
      if (value === undefined || value === null || value === '') {
        return res.status(400).json({
          message: `${field} is required`
        });
      }
    }
    next();
  };

/**
 * Validates that route parameters are positive integers, so malformed IDs
 * return 400 instead of surfacing Postgres type errors as 500s.
 */
export const validateIdParam = (...params: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    for (const param of params) {
      const value = Number(req.params[param]);
      if (!Number.isInteger(value) || value < 1) {
        return res.status(400).json({
          message: `${param} must be a positive integer`
        });
      }
    }
    next();
  };

/**
 * Validates that a body field is a positive integer.
 */
export const validateIntBody = (field: string) =>
  (req: Request, res: Response, next: NextFunction) => {
    const value = Number(req.body[field]);
    if (!Number.isInteger(value) || value < 1) {
      return res.status(400).json({
        message: `${field} must be a positive integer`
      });
    }
    next();
  };

/**
 * Validates that a body field is a trimmed non-empty string.
 */
export const validateTrimmedBody = (field: string, message?: string) =>
  (req: Request, res: Response, next: NextFunction) => {
    const value = req.body[field];
    if (!value || !String(value).trim()) {
      return res.status(400).json({
        message: message || `${field} is required`
      });
    }
    next();
  };
