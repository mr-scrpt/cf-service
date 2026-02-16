import { Router } from 'express';
import type { DIContainer } from '@cloudflare-bot/infrastructure';
import { ROUTES } from '@shared/constants/routes';
import { ControllerFactory } from '@infrastructure/factories';

export function createNotifyRoutes(container: DIContainer): Router {
  const router = Router();
  
  const controller = ControllerFactory.createNotificationController(container);

  router.get(
    ROUTES.NOTIFY.BASE,
    (req, res) => controller.getInfo(req, res)
  );

  router.post(
    ROUTES.NOTIFY.BASE,
    (req, res) => controller.handleNotification(req, res)
  );

  return router;
}
