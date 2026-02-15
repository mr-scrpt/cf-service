import { Router, Response } from 'express';
import type { DIContainer } from '@cloudflare-bot/infrastructure';
import { ROUTES } from '../constants/routes';
import type { TypedRequestBody, TypedRequestParams, ApiResponse } from '../types/express.types';
import type { UserDto } from '@cloudflare-bot/application';

interface AddUserBody {
  telegramId: number;
  username?: string;
}

interface UserParams extends Record<string, string> {
  telegramId: string;
}

export function createUserRoutes(container: DIContainer): Router {
  const router = Router();
  const addUserUseCase = container.getAddUserUseCase();
  const listUsersUseCase = container.getListUsersUseCase();
  const removeUserUseCase = container.getRemoveUserUseCase();

  router.post(
    ROUTES.USERS.BASE,
    async (req: TypedRequestBody<AddUserBody>, res: Response<ApiResponse<UserDto>>) => {
      try {
        const user = await addUserUseCase.execute({
          telegramId: req.body.telegramId,
          username: req.body.username,
        });

        res.status(201).json({ success: true, data: user });
      } catch (error) {
        console.error('Add user error:', error);
        res.status(400).json({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to add user',
        });
      }
    }
  );

  router.get(
    ROUTES.USERS.BASE,
    async (req, res: Response<ApiResponse<UserDto[]>>) => {
      try {
        const users = await listUsersUseCase.execute();
        res.status(200).json({ success: true, data: users });
      } catch (error) {
        console.error('List users error:', error);
        res.status(500).json({ success: false, message: 'Failed to list users' });
      }
    }
  );

  router.delete(
    ROUTES.USERS.BY_TELEGRAM_ID,
    async (req: TypedRequestParams<UserParams>, res: Response<ApiResponse>) => {
      try {
        const telegramIdParam = req.params.telegramId;
        const telegramId = parseInt(Array.isArray(telegramIdParam) ? telegramIdParam[0] : telegramIdParam, 10);
        await removeUserUseCase.execute(telegramId);
        res.status(200).json({ success: true, message: 'User removed' });
      } catch (error) {
        console.error('Remove user error:', error);
        res.status(400).json({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to remove user',
        });
      }
    }
  );

  return router;
}
