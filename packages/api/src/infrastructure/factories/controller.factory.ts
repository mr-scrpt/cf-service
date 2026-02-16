import type { DIContainer } from '@cloudflare-bot/infrastructure';
import { RegistrationController } from '@presentation/controllers/registration.controller';
import { UserController } from '@presentation/controllers/user.controller';
import { WebhookController } from '@presentation/controllers/webhook.controller';
import { RegistrationService } from '@application/services/registration.service';
import { UserService } from '@application/services/user.service';
import { WebhookService } from '@application/services/webhook.service';
import { ResponseHelper } from '@shared/utils/response.helper';
import { ErrorMapper } from '@infrastructure/mappers/error.mapper';

export class ControllerFactory {
  private static responseHelper: ResponseHelper;

  private static getResponseHelper(): ResponseHelper {
    if (!this.responseHelper) {
      this.responseHelper = new ResponseHelper(new ErrorMapper());
    }
    return this.responseHelper;
  }

  static createRegistrationController(container: DIContainer): RegistrationController {
    const serviceData = container.getRegistrationService();
    const registrationService = new RegistrationService(
      serviceData.createRequestUseCase,
      serviceData.listPendingRequestsUseCase,
      serviceData.approveRequestUseCase,
      serviceData.rejectRequestUseCase,
      serviceData.logger
    );

    return new RegistrationController(
      registrationService,
      this.getResponseHelper()
    );
  }

  static createUserController(container: DIContainer): UserController {
    const serviceData = container.getUserService();
    const userService = new UserService(
      serviceData.addUserUseCase,
      serviceData.listUsersUseCase,
      serviceData.removeUserUseCase,
      serviceData.logger
    );

    return new UserController(
      userService,
      this.getResponseHelper()
    );
  }

  static createWebhookController(container: DIContainer): WebhookController {
    const webhookService = new WebhookService(
      container.getSendWebhookNotificationUseCase(),
      container.getLogger()
    );

    return new WebhookController(
      webhookService,
      this.getResponseHelper()
    );
  }
}
