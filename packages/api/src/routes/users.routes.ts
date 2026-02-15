import { Router, Request, Response } from 'express';
import { DIContainer } from '@cloudflare-bot/infrastructure';

export function createUserRoutes(container: DIContainer): Router {
  const router = Router();
  const addUserUseCase = container.getAddUserUseCase();
  const listUsersUseCase = container.getListUsersUseCase();
  const removeUserUseCase = container.getRemoveUserUseCase();

  router.post('/users', async (req: Request, res: Response) => {
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
  });

  router.get('/users', async (req: Request, res: Response) => {
    try {
      const users = await listUsersUseCase.execute();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({ success: false, message: 'Failed to list users' });
    }
  });

  router.delete('/users/:telegramId', async (req: Request, res: Response) => {
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
  });

  return router;
}
