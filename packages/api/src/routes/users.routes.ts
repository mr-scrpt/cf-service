import { Router } from 'express';
import type { DIContainer } from '@cloudflare-bot/infrastructure';
import { ROUTES } from '../constants/routes';
import type { TypedRequestBody, TypedRequestParams } from '../types/express.types';
import { UserService } from '../services/user.service';
import { ResponseHelper } from '../utils/response.helper';
import { ErrorMapper } from '../mappers/error.mapper';

interface AddUserBody {
  telegramId: number;
  username?: string;
}

interface UserParams extends Record<string, string> {
  telegramId: string;
}

export function createUserRoutes(container: DIContainer): Router {
  const router = Router();
  
  const userService = new UserService(
    container.getAddUserUseCase(),
    container.getListUsersUseCase(),
    container.getRemoveUserUseCase(),
    container.getLogger()
  );
  
  const responseHelper = new ResponseHelper(new ErrorMapper());

  router.post(
    ROUTES.USERS.BASE,
    async (req: TypedRequestBody<AddUserBody>, res) => {
      const result = await userService.addUser({
        telegramId: req.body.telegramId,
        username: req.body.username,
      });
      responseHelper.send(res, result, { successStatus: 201 });
    }
  );

  router.get(
    ROUTES.USERS.BASE,
    async (req, res) => {
      const result = await userService.listUsers();
      responseHelper.send(res, result);
    }
  );

  router.delete(
    ROUTES.USERS.BY_TELEGRAM_ID,
    async (req: TypedRequestParams<UserParams>, res) => {
      const telegramIdParam = req.params.telegramId;
      const telegramId = parseInt(Array.isArray(telegramIdParam) ? telegramIdParam[0] : telegramIdParam, 10);
      
      const result = await userService.removeUser(telegramId);
      responseHelper.sendMessage(res, result, 'User removed');
    }
  );

  return router;
}
