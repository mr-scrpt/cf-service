import { UserAlreadyExistsError, UserNotFoundError } from '@cloudflare-bot/application';
import type { ApiResponse } from '../types/express.types';

export class ErrorMapper {
  map(error: Error): { status: number; body: ApiResponse } {
    if (error instanceof UserAlreadyExistsError) {
      return {
        status: 409,
        body: {
          success: false,
          message: error.message,
          code: error.code,
        },
      };
    }

    if (error instanceof UserNotFoundError) {
      return {
        status: 404,
        body: {
          success: false,
          message: error.message,
          code: error.code,
        },
      };
    }

    return {
      status: 400,
      body: {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
    };
  }
}
