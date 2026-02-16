import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export class ValidationMiddleware {
  static validateBody<T>(schema: z.ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        res.status(400).json({
          success: false,
          message: JSON.stringify(result.error.errors),
        });
        return;
      }
      
      req.body = result.data;
      next();
    };
  }

  static validateParams<T>(schema: z.ZodSchema<T>) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        res.status(400).json({
          success: false,
          message: JSON.stringify(result.error.errors),
        });
        return;
      }
      
      req.params = result.data as Record<string, string>;
      next();
    };
  }
}
