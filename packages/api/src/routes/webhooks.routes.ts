import { Router, Request, Response } from 'express';
import { DIContainer } from '@cloudflare-bot/infrastructure';

export function createWebhookRoutes(container: DIContainer): Router {
  const router = Router();
  const sendNotificationUseCase = container.getSendWebhookNotificationUseCase();

  router.post('/webhook', async (req: Request, res: Response) => {
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
      console.error('Webhook error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  router.get('/webhook', (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'Webhook endpoint is alive' });
  });

  return router;
}
