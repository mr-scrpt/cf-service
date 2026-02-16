import { Router } from 'express';
import type { DIContainer } from '@cloudflare-bot/infrastructure';
import { ROUTES } from '@shared/constants/routes';
import { ControllerFactory } from '@infrastructure/factories';

export function createWebhookRoutes(container: DIContainer): Router {
  const router = Router();
  
  const controller = ControllerFactory.createWebhookController(container);

  router.post(
    ROUTES.WEBHOOK.BASE,
    (req, res) => controller.handleNotification(req, res)
  );

  return router;
}
