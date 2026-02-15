import { Router } from 'express';
import type { DIContainer } from '@cloudflare-bot/infrastructure';
import { RegistrationService } from '../services/registration.service';
import { ResponseHelper } from '../utils/response.helper';
import { ErrorMapper } from '../mappers/error.mapper';
import { ROUTES } from '../constants/routes';

interface TypedRequestBody<T> extends Express.Request {
  body: T;
  params: Record<string, string>;
}

interface CreateRequestBody {
  telegramId: number;
  username: string;
  firstName: string;
  lastName?: string;
}

interface ReviewRequestBody {
  reviewedBy: string;
}

export function createRegistrationRoutes(container: DIContainer): Router {
  const router = Router();
  
  const serviceData = container.getRegistrationService();
  const registrationService = new RegistrationService(
    serviceData.createRequestUseCase,
    serviceData.listPendingRequestsUseCase,
    serviceData.approveRequestUseCase,
    serviceData.rejectRequestUseCase,
    serviceData.logger
  );
  
  const responseHelper = new ResponseHelper(new ErrorMapper());

  router.post(
    ROUTES.REGISTRATION_REQUESTS.BASE,
    async (req: TypedRequestBody<CreateRequestBody>, res) => {
      const result = await registrationService.createRequest(req.body);
      responseHelper.send(res, result, { successStatus: 201 });
    }
  );

  router.get(
    ROUTES.REGISTRATION_REQUESTS.PENDING,
    async (req, res) => {
      const result = await registrationService.listPending();
      responseHelper.send(res, result);
    }
  );

  router.post(
    ROUTES.REGISTRATION_REQUESTS.APPROVE,
    async (req: TypedRequestBody<ReviewRequestBody>, res) => {
      const requestId = req.params.requestId;
      const result = await registrationService.approve({
        requestId,
        reviewedBy: req.body.reviewedBy,
      });
      responseHelper.sendMessage(res, result, 'Registration request approved');
    }
  );

  router.post(
    ROUTES.REGISTRATION_REQUESTS.REJECT,
    async (req: TypedRequestBody<ReviewRequestBody>, res) => {
      const requestId = req.params.requestId;
      const result = await registrationService.reject({
        requestId,
        reviewedBy: req.body.reviewedBy,
      });
      responseHelper.sendMessage(res, result, 'Registration request rejected');
    }
  );

  return router;
}
