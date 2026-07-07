import type { Request, Response, NextFunction } from 'express';

// Express middleware signature: (req, res, next) => void.
// Middleware runs sequentially before the route handler.

export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
}
