import { Response } from 'express';
import { Result } from '@cloudflare-bot/application';
import type { ApiResponse } from '@shared/types/express.types';
import { ErrorMapper } from '@infrastructure/mappers/error.mapper';

export class ResponseHelper {
  constructor(private errorMapper: ErrorMapper) {}

  send<T>(
    res: Response,
    result: Result<T, Error>,
    options?: { successStatus?: number }
  ): void {
    if (result.isSuccess) {
      res.status(options?.successStatus || 200).json({
        success: true,
        data: result.getValue(),
      } as ApiResponse<T>);
      return;
    }

    const response = this.errorMapper.map(result.getError());
    res.status(response.status).json(response.body);
  }

  sendMessage(
    res: Response,
    result: Result<void, Error>,
    message: string,
    options?: { successStatus?: number }
  ): void {
    if (result.isSuccess) {
      res.status(options?.successStatus || 200).json({
        success: true,
        message,
      } as ApiResponse);
      return;
    }

    const response = this.errorMapper.map(result.getError());
    res.status(response.status).json(response.body);
  }
}
