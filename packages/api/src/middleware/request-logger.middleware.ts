import { Request, Response, NextFunction } from 'express';
import type { ILogger } from '@cloudflare-bot/application';

function sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
  const sanitized = { ...headers };
  if (sanitized.authorization) {
    sanitized.authorization = sanitized.authorization.replace(/Bearer .+/, 'Bearer ***');
  }
  if (sanitized.cookie) {
    sanitized.cookie = '***';
  }
  return sanitized;
}

function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***';
    }
  });
  
  return sanitized;
}

export function createRequestLoggerMiddleware(logger: ILogger & { logRequest?: (data: any) => void; logResponse?: (data: any) => void }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const startTime = Date.now();

    if (logger.logRequest) {
      logger.logRequest({
        method: req.method,
        url: req.originalUrl,
        headers: sanitizeHeaders(req.headers as Record<string, any>),
        body: sanitizeBody(req.body),
        query: req.query,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
      });
    }

    const originalSend = res.send;
    let responseBody: any;

    res.send = function(data: any): Response {
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
          body: responseBody ? JSON.parse(responseBody) : null,
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
