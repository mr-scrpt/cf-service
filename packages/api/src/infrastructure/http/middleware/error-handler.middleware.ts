import { Request, Response, NextFunction } from 'express';
import { Environment } from '@cloudflare-bot/shared';
import { env } from '@shared/config/env.config';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  res.status(500).json({
    success: false,
    message: env.NODE_ENV === Environment.PRODUCTION ? 'Internal server error' : err.message,
  });
}
