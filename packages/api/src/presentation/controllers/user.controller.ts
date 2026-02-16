import { Request, Response } from 'express';
import { UserService } from '@application/services/user.service';
import { ResponseHelper } from '@shared/utils/response.helper';
import { RequestParamsParser } from '@presentation/parsers';
import type { AddUserDto } from '@cloudflare-bot/application';

export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly responseHelper: ResponseHelper
  ) {}

  async addUser(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.body;
      const telegramId = RequestParamsParser.getNumberParam(req.params, 'telegramId');
      
      const result = await this.userService.addUser({ username, telegramId } as AddUserDto);
      this.responseHelper.send(res, result, { successStatus: 201 });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Invalid request' });
    }
  }

  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.userService.listUsers();
      this.responseHelper.send(res, result);
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Invalid request' });
    }
  }

  async removeUser(req: Request, res: Response): Promise<void> {
    try {
      const telegramId = RequestParamsParser.getNumberParam(req.params, 'telegramId');
      const result = await this.userService.removeUser(telegramId);
      this.responseHelper.sendMessage(res, result, 'User removed successfully');
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Invalid request' });
    }
  }
}
