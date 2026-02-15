import { Router, Request } from 'express';
import type { DIContainer } from '@cloudflare-bot/infrastructure';
import { ROUTES } from '../constants/routes';
import { WebhookService } from '../services/webhook.service';
import { ResponseHelper } from '../utils/response.helper';
import { ErrorMapper } from '../mappers/error.mapper';

export function createWebhookRoutes(container: DIContainer): Router {
  const router = Router();
  
  const webhookService = new WebhookService(
    container.getSendWebhookNotificationUseCase(),
    container.getLogger()
  );
  
  const responseHelper = new ResponseHelper(new ErrorMapper());

  router.post(
    ROUTES.WEBHOOK.BASE,
    async (req: Request, res) => {
      const result = await webhookService.processWebhook({
        method: req.method,
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        headers: req.headers as Record<string, string | string[] | undefined>,
        body: req.body,
        timestamp: new Date(),
      });
      
      responseHelper.sendMessage(res, result, 'Webhook processed');
    }
  );

  router.get(
    ROUTES.WEBHOOK.BASE,
    (req: Request, res) => {
      container.getLogger().info('Webhook health check', { ip: req.ip });
      res.status(200).json({ success: true, message: 'Webhook endpoint is active' });
    }
  );

  return router;
}
