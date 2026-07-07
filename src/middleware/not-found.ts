import type { Request, Response } from 'express';
import { errorResponse } from '../utils/helpers.js';

// This middleware runs after all routes. If no route matched,
// Express falls through to here and we return a 404.

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json(errorResponse('Route not found'));
}
