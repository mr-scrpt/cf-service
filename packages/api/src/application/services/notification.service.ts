import { Result, SendNotificationUseCase } from '@cloudflare-bot/application';
import type { ILogger, NotificationPayloadDto } from '@cloudflare-bot/application';
import { BaseService } from './base.service';

export class NotificationService extends BaseService {
  constructor(
    private sendNotificationUseCase: SendNotificationUseCase,
    logger: ILogger
  ) {
    super(logger);
  }

  async processNotification(payload: NotificationPayloadDto): Promise<Result<void, Error>> {
    return this.execute(
      () => this.sendNotificationUseCase.execute(payload),
      'Process notification',
      { method: payload.method, ip: payload.ip }
    );
  }
}
