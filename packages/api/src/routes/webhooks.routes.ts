import { Router, Request, Response } from 'express';
import type { DIContainer } from '@cloudflare-bot/infrastructure';
import { ROUTES } from '../constants/routes';
import type { ApiResponse } from '../types/express.types';

export function createWebhookRoutes(container: DIContainer): Router {
  const router = Router();
  const sendNotificationUseCase = container.getSendWebhookNotificationUseCase();
  const logger = container.getLogger();

  router.post(
    ROUTES.WEBHOOK.BASE,
    async (req: Request, res: Response<ApiResponse>) => {
      try {
        await sendNotificationUseCase.execute({
          method: req.method,
          ip: req.ip || req.connection.remoteAddress || 'unknown',
          headers: req.headers as Record<string, string | string[] | undefined>,
          body: req.body,
          timestamp: new Date(),
        });

        res.status(200).json({ success: true, message: 'Webhook received' });
      } catch (error) {
        logger.error('Webhook processing failed', { 
          method: req.method,
          ip: req.ip,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  );

  router.get(
    ROUTES.WEBHOOK.BASE,
    (req: Request, res: Response<ApiResponse>) => {
      res.status(200).json({ success: true, message: 'Webhook endpoint is alive' });
    }
  );

  return router;
}
