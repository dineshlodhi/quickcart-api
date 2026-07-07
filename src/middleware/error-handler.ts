import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-errors.js';
import { errorResponse } from '../utils/helpers.js';

// Express error middleware must have exactly 4 parameters.
// The `_next` parameter is required even if unused — Express uses
// the parameter count to identify this as an error handler.

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // `instanceof` narrows the type: inside this block, TypeScript
  // knows `err` is an AppError and allows access to `statusCode`.
  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.message));
    return;
  }

  // Unexpected errors — log the full error but return a generic message.
  console.error('Unexpected error:', err);
  res.status(500).json(errorResponse('Internal server error'));
}
