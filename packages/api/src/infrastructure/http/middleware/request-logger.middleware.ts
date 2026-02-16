import { Request, Response, NextFunction } from 'express';
import type { IApiLogger } from '@shared/types/logger.types';

function sanitizeHeaders(headers: Record<string, string | string[] | undefined>): Record<string, string | string[] | undefined> {
  const sanitized = { ...headers };
  if (sanitized.authorization && typeof sanitized.authorization === 'string') {
    sanitized.authorization = sanitized.authorization.replace(/Bearer .+/, 'Bearer ***');
  }
  if (sanitized.cookie) {
    sanitized.cookie = '***';
  }
  return sanitized;
}

function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  const sanitized = { ...(body as Record<string, unknown>) };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***';
    }
  });
  
  return sanitized;
}

export function createRequestLoggerMiddleware(logger: IApiLogger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    if (logger.logRequest) {
      logger.logRequest({
        method: req.method,
        url: req.originalUrl,
        headers: sanitizeHeaders(req.headers),
        body: sanitizeBody(req.body),
        query: req.query as Record<string, unknown>,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
      });
    }

    const originalSend = res.send;
    let responseBody: unknown;

    res.send = function(data: unknown): Response {
      responseBody = data;
      res.send = originalSend;
      return originalSend.call(this, data);
    };

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const { statusCode } = res;

      if (logger.logResponse) {
        logger.logResponse({
          method: req.method,
          url: req.originalUrl,
          statusCode,
          duration: `${duration}ms`,
          body: responseBody && typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody,
        });
      }

      const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
      logger[level]('HTTP Request Completed', {
        method: req.method,
        url: req.originalUrl,
        statusCode,
        duration: `${duration}ms`,
      });
    });

    next();
  };
}
