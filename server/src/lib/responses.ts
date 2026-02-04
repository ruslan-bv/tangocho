import type { Response } from 'express';

/**
 * HTTP response helpers for consistent API responses.
 */

export const notFound = (res: Response, entity: string): Response =>
  res.status(404).json({ message: `${entity} not found` });

export const badRequest = (res: Response, message: string): Response =>
  res.status(400).json({ message });

export const conflict = (res: Response, message: string): Response =>
  res.status(409).json({ message });

export const created = <T>(res: Response, data: T): Response =>
  res.status(201).json(data);

export const noContent = (res: Response): void => {
  res.status(204).send();
};
