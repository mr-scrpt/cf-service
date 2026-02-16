import { Router } from 'express';
import type { DIContainer } from '@cloudflare-bot/infrastructure';
import { ROUTES } from '@shared/constants/routes';
import { ControllerFactory } from '@infrastructure/factories';

export function createUserRoutes(container: DIContainer): Router {
  const router = Router();

  const controller = ControllerFactory.createUserController(container);

  router.post(
    ROUTES.USERS.BASE,
    (req, res) => controller.addUser(req, res)
  );

  router.get(
    ROUTES.USERS.BASE,
    (req, res) => controller.listUsers(req, res)
  );

  router.delete(
    ROUTES.USERS.BY_TELEGRAM_ID,
    (req, res) => controller.removeUser(req, res)
  );

  return router;
}
