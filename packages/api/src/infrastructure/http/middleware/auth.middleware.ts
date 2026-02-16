import { Request, Response, NextFunction } from 'express';

export function authMiddleware(apiAuthToken: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7);

    if (token !== apiAuthToken) {
      res.status(401).json({ success: false, message: 'Invalid API token' });
      return;
    }

    next();
  };
}
