import { Router } from 'express';
import type { DIContainer } from '@cloudflare-bot/infrastructure';
import { ROUTES } from '@shared/constants/routes';
import { ControllerFactory } from '@infrastructure/factories';
import { ValidationMiddleware } from '@infrastructure/http/middleware/validation.middleware';
import { 
  createRegistrationRequestDtoSchema, 
  reviewRegistrationRequestDtoSchema 
} from '@cloudflare-bot/application';

export function createRegistrationRoutes(container: DIContainer): Router {
  const router = Router();
  
  const controller = ControllerFactory.createRegistrationController(container);

  router.post(
    ROUTES.REGISTRATION_REQUESTS.BASE,
    ValidationMiddleware.validateBody(createRegistrationRequestDtoSchema),
    (req, res) => controller.createRequest(req, res)
  );

  router.get(
    ROUTES.REGISTRATION_REQUESTS.PENDING,
    (req, res) => controller.listPending(req, res)
  );

  router.post(
    ROUTES.REGISTRATION_REQUESTS.APPROVE,
    ValidationMiddleware.validateBody(reviewRegistrationRequestDtoSchema.pick({ reviewedBy: true })),
    (req, res) => controller.approve(req, res)
  );

  router.post(
    ROUTES.REGISTRATION_REQUESTS.REJECT,
    ValidationMiddleware.validateBody(reviewRegistrationRequestDtoSchema.pick({ reviewedBy: true })),
    (req, res) => controller.reject(req, res)
  );

  return router;
}
