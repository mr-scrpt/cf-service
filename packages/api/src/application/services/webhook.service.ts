import { Result, SendWebhookNotificationUseCase } from '@cloudflare-bot/application';
import type { ILogger, WebhookPayloadDto } from '@cloudflare-bot/application';
import { BaseService } from './base.service';

export class WebhookService extends BaseService {
  constructor(
    private sendNotificationUseCase: SendWebhookNotificationUseCase,
    logger: ILogger
  ) {
    super(logger);
  }

  async processWebhook(payload: WebhookPayloadDto): Promise<Result<void, Error>> {
    return this.execute(
      () => this.sendNotificationUseCase.execute(payload),
      'Process webhook',
      { method: payload.method, ip: payload.ip }
    );
  }
}
